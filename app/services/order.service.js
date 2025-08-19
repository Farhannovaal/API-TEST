const prisma = require('../libs/prisma');
const tenantRepo = require('../repo/tenant.repo');
const menuRepo = require('../repo/menus.repo');

async function createOrder(payload) {
    const { user_id, tenant_id, payment_method, notes, items } = payload;
    const tenant = await tenantRepo.findById(tenant_id);
    if (!tenant) return { error: 'Tenant not found' };

    const ids = [...new Set(items.map(i => i.menu_id))];
    const menus = await menuRepo.findByIds(ids);
    if (menus.length !== ids.length) return { error: 'Some menu_id not found' };

    const map = new Map(menus.map(m => [m.id, m]));
    for (const it of items) {
        const m = map.get(it.menu_id);
        if (!m) return { error: `Menu ${it.menu_id} not found` };
        if (m.tenantId !== Number(tenant_id)) return { error: `Menu ${it.menu_id} does not belong to tenant ${tenant_id}` };
        if (m.stockQty < it.qty) return { error: `Insufficient stock for menu ${it.menu_id}` };
    }

    let total = 0;
    const enriched = items.map(it => {
        const m = map.get(it.menu_id);
        const unit = Number(m.price);
        const subtotal = unit * it.qty;
        total += subtotal;
        return { ...it, unit_price: unit, subtotal };
    });

    const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                userId: Number(user_id),
                tenantId: Number(tenant_id),
                status: 'pending',
                paymentMethod: payment_method || 'cash',
                totalAmount: total,
                notes: notes ?? null,
            },
            select: { id: true }
        });

        for (const it of enriched) {
            const ok = await tx.menu.updateMany({
                where: { id: Number(it.menu_id), tenantId: Number(tenant_id), stockQty: { gte: Number(it.qty) } },
                data: { stockQty: { decrement: Number(it.qty) } },
            });
            if (ok.count === 0) throw new Error(`Insufficient stock for menu ${it.menu_id}`);

            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    menuId: Number(it.menu_id),
                    qty: Number(it.qty),
                    unitPrice: it.unit_price,
                    subtotal: it.subtotal,
                }
            });
        }

        return order.id;
    });

    const order = await prisma.order.findUnique({
        where: { id: result },
        include: {
            items: { include: { menu: { select: { name: true } } }, orderBy: { id: 'asc' } },
            tenant: { select: { name: true } },
        }
    });

    return {
        data: {
            id: order.id,
            user_id: order.userId,
            tenant_id: order.tenantId,
            status: order.status,
            payment_method: order.paymentMethod,
            total_amount: order.totalAmount,  // Prisma Decimal → bisa Number(order.totalAmount)
            note: order.notes ?? null,
            created_at: order.createdAt,
            updated_at: order.updatedAt,
            tenant_name: order.tenant?.name,
            items: order.items.map(it => ({
                id: it.id,
                menu_id: it.menuId,
                qty: it.qty,
                unit_price: it.unitPrice,
                subtotal: it.subtotal,
                menu_name: it.menu?.name,
            })),
        }
    };
}

async function getOrder(id) {
    const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
            items: { include: { menu: { select: { name: true } } } },
            tenant: { select: { name: true } }
        }
    });
    if (!order) return { error: 'Order not found' };
    return {
        data: {
            id: order.id,
            user_id: order.userId,
            tenant_id: order.tenantId,
            status: order.status,
            payment_method: order.paymentMethod,
            total_amount: order.totalAmount,
            note: order.notes ?? null,
            created_at: order.createdAt,
            updated_at: order.updatedAt,
            tenant_name: order.tenant?.name,
            items: order.items.map(it => ({
                id: it.id, menu_id: it.menuId, qty: it.qty, unit_price: it.unitPrice, subtotal: it.subtotal, menu_name: it.menu?.name
            })),
        }
    };
}

async function listOrders(q = {}) {
    const where = {};
    if (q.tenant_id) where.tenantId = Number(q.tenant_id);
    if (q.user_id) where.userId = Number(q.user_id);
    if (q.status) where.status = String(q.status);

    const page = Math.max(1, +q.page || 1);
    const take = Math.min(200, Math.max(1, +q.page_size || 20));
    const skip = (page - 1) * take;

    const rows = await prisma.order.findMany({
        where,
        orderBy: { id: 'desc' },
        skip, take,
        include: { tenant: { select: { name: true } } }
    });

    return {
        data: rows.map(o => ({
            id: o.id,
            user_id: o.userId,
            tenant_id: o.tenantId,
            status: o.status,
            payment_method: o.paymentMethod,
            total_amount: o.totalAmount,
            note: o.notes ?? null,
            created_at: o.createdAt,
            updated_at: o.updatedAt,
            tenant_name: o.tenant?.name
        }))
    };
}

async function cancelOrder(id) {
    const updated = await prisma.$transaction(async (tx) => {
        const exists = await tx.order.findUnique({ where: { id: Number(id) } });
        if (!exists || !['pending', 'paid'].includes(exists.status)) return 0;

        const items = await tx.orderItem.findMany({ where: { orderId: exists.id } });
        for (const it of items) {
            await tx.menu.update({ where: { id: it.menuId }, data: { stockQty: { increment: it.qty } } });
        }
        await tx.order.update({ where: { id: exists.id }, data: { status: 'cancelled' } });
        return 1;
    });

    if (!updated) return { error: 'Order not found or not cancellable' };
    return getOrder(id);
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
