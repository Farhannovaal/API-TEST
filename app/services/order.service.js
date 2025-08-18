const pool = require('../db/pool');
const tenantRepo = require('../repo/tenant.repo');
const menuRepo = require('../repo/menus.repo');
const orderRepo = require('../repo/order.repo');

async function createOrder(payload) {
    const { user_id, tenant_id, payment_method, notes, items } = payload;

    const tenant = await tenantRepo.findById(tenant_id);
    if (!tenant) return { error: 'Tenant not found' };

    const ids = [...new Set(items.map(i => i.menu_id))];
    const menus = await menuRepo.findByIds(ids);
    if (menus.length !== ids.length) return { error: 'Some menu_id not found' };

    const menuMap = new Map(menus.map(m => [m.id, m]));
    for (const it of items) {
        const m = menuMap.get(it.menu_id);
        if (m.tenant_id !== tenant_id) return { error: `Menu ${it.menu_id} does not belong to tenant ${tenant_id}` };
        if (m.stock_qty < it.qty) return { error: `Insufficient stock for menu ${it.menu_id}` };
    }

    let total = 0;
    const enriched = items.map(it => {
        const m = menuMap.get(it.menu_id);
        const subtotal = Number(m.price) * it.qty;
        total += subtotal;
        return { ...it, unit_price: Number(m.price), subtotal };
    });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const orderId = await orderRepo.createOrderTx(conn, {
            user_id, tenant_id, payment_method, total_amount: total, notes
        });

        for (const it of enriched) {
            const ok = await menuRepo.deductStock(conn, {
                menuId: it.menu_id, tenantId: tenant_id, qty: it.qty
            });
            if (!ok) throw new Error(`Insufficient stock for menu ${it.menu_id}`);

            await orderRepo.insertOrderItemTx(conn, {
                order_id: orderId,
                menu_id: it.menu_id,
                qty: it.qty,
                unit_price: it.unit_price,
                subtotal: it.subtotal
            });
        }

        await conn.commit();
        const order = await orderRepo.getOrderWithItems(orderId);
        return { data: order };
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}

async function getOrder(id) {
    const row = await orderRepo.getOrderWithItems(id);
    if (!row) return { error: 'Order not found' };
    return { data: row };
}

async function listOrders(filters) {
    const rows = await orderRepo.listOrders(filters);
    return { data: rows };
}

async function cancelOrder(id) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const affected = await orderRepo.cancelOrderTx(conn, id);
        if (!affected) {
            await conn.rollback();
            return { error: 'Order not found or not cancellable' };
        }
        const items = await orderRepo.getOrderItems(conn, id);
        for (const it of items) {
            await menuRepo.restoreStock(conn, { menuId: it.menu_id, qty: it.qty });
        }

        await conn.commit();
        const order = await orderRepo.getOrderWithItems(id);
        return { data: order };
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
