import { get } from '../request'

const ADMIN_STATS_ENDPOINT = '/api/admin/stats'

export const fetchAdminStats = () => get(ADMIN_STATS_ENDPOINT)
