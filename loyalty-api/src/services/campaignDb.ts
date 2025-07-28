import mysql from 'mysql2/promise'

// Shared database pool
let pool: mysql.Pool | null = null

const hostname = process.env.CHOREO_LOYALTYDB_HOSTNAME;
const port = process.env.CHOREO_LOYALTYDB_PORT;
const username = process.env.CHOREO_LOYALTYDB_USERNAME;
const password = process.env.CHOREO_LOYALTYDB_PASSWORD;
const databasename = process.env.CHOREO_LOYALTYDB_DATABASENAME;

// Initialize database connection
const getPool = (): mysql.Pool => {
    if (!pool) {
        pool = mysql.createPool({
            host: hostname,
            port: port ? parseInt(port) : 3306,
            user: username,
            password: password,
            database: databasename,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
    }
    return pool
}

// Get user fb id from email
export const getUserFbID = async (email: string): Promise<string | null> => {
    try {
        const dbPool = getPool()
        const [rows] = await dbPool.execute(
            'SELECT facebook_user_id FROM email_facebook_mapping WHERE email = ?',
            [email]
        )
        // Select the first one from query result
        return (Array.isArray(rows) && rows.length > 0) ? (rows[0] as any).facebook_user_id : null;
    } catch (error) {
        console.error('Error fetching active campaigns:', error)
        throw error
    }
}

// Get new posts from database
export const getNewPosts = async (posts: any[]): Promise<any[]> => {
    try {
        const dbPool = getPool()

        if (posts.length === 0) {
            return []
        }

        // Extract post IDs from the posts array
        const postIds = posts.map(post => post.postId)

        // Query to find posts that are not in posts_loyalty_points table
        const placeholders = postIds.map(() => '?').join(',')
        const [rows] = await dbPool.execute(
            `SELECT post_id FROM posts_loyalty_points WHERE post_id IN (${placeholders})`,
            postIds
        )

        // Get the post IDs that are already in the database
        const existingPostIds = (rows as any[]).map(row => row.post_id)

        // Filter out posts that are already in the database
        const newPosts = posts.filter(post => !existingPostIds.includes(post.postId))

        return newPosts
    } catch (error) {
        console.error('Error filtering new posts:', error)
        throw error
    }
}

// Close database connection
export const closeDbConnection = async (): Promise<void> => {
    if (pool) {
        await pool.end()
        pool = null
    }
}