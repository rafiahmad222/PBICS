export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    OWNER: 'Owner',
    DOCTOR: 'Dokter',
    CS: 'Customer Service',
    HRD: 'HRD',
    SUPERVISOR_TREATMENT: 'Supervisor Treatment',
    SUPERVISOR_PRODUK: 'Supervisor Produk',
    GUDANG_UMUM: 'Gudang Umum',
    STAFF_OB: 'Staff OB',
    STAFF_SATPAM: 'Staff Satpam',
    APOTEKER: 'Apoteker',
    ASISTEN_SUPERVISOR_TREATMENT: 'Asisten Supervisor Treatment'
};


export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'], // Full access to everything
    [ROLES.DOCTOR]: ['/', '/medical-records', '/patients', '/attendance'],
    [ROLES.CS]: ['/', '/patients', '/sales', '/attendance', '/notifications', '/reservations', '/cs-products', '/cs-treatments'],
    [ROLES.HRD]: ['/', '/staff', '/patients', '/attendance'],
    [ROLES.SUPERVISOR_TREATMENT]: ['/', '/promos', '/attendance', '/cs-treatments'],
    [ROLES.SUPERVISOR_PRODUK]: ['/', '/promos', '/attendance', '/cs-products'],
    [ROLES.OWNER]: ['/', '/patients', '/staff', '/reports', '/attendance', '/reservations'],
    [ROLES.GUDANG_UMUM]: ['/', '/products', '/treatments', '/attendance', '/management'],
    [ROLES.STAFF_OB]: ['/attendance'],
    [ROLES.STAFF_SATPAM]: ['/attendance'],
    [ROLES.APOTEKER]: ['/', '/attendance', '/apotek-inventory'],
    [ROLES.ASISTEN_SUPERVISOR_TREATMENT]: ['/', '/reservations', '/attendance'],
};


export const hasPermission = (userRole, path) => {
    if (!userRole || !path) return false;

    const roleKey = Object.keys(ROLE_PERMISSIONS).find(key =>
        key.toLowerCase().trim() === userRole.toLowerCase().trim()
    );

    if (!roleKey) return false;

    const allowedPaths = ROLE_PERMISSIONS[roleKey];

    // Super Admin has full access to everything except individual stock pages
    if (allowedPaths.includes('*')) {
        if (path === '/cs-products' || path === '/cs-treatments' || path === '/management' || path === '/apotek-inventory') {
            return false;
        }
        return true;
    }

    if (path === '/') return allowedPaths.includes('/');

    return allowedPaths.some(allowed => {
        if (allowed === '/') return false;
        // Cek path secara exact (persis)
        return path === allowed || path.startsWith(allowed + '/');
    });
};