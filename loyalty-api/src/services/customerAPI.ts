import axios from 'axios'

type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD';
type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface Customer {
    customerId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    registrationDate: string;
    loyaltyTier: LoyaltyTier;
    totalLifetimePoints: number;
    currentAvailablePoints: number;
    accountStatus: AccountStatus;
}

interface Pagination {
    offset: number;
    limit: number;
    total: number;
}

interface CustomerResponse {
    customers: Customer[];
    pagination: Pagination;
}

interface PointsTransaction {
    id: string
    customer_id: string
    type: 'earn' | 'spend'
    amount: number
    description: string
    source: string
    created_at: string
}


// Env passed by choreo
const serviceURL = process.env.CHOREO_LOYALTYCUSTOMERAPI_SERVICEURL;
const choreoApiKey = process.env.CHOREO_LOYALTYCUSTOMERAPI_APIKEY;

// Shared API client
let apiClient: any = null

// Initialize API client
const getApiClient = () => {
    if (!apiClient) {
        apiClient = axios.create({
            baseURL: serviceURL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'Choreo-API-Key': choreoApiKey
            }
        })
    }
    return apiClient
}

// Get customer by ID
export const getCustomerByIdByEmail = async (email: string): Promise<string | null> => {
    try {
        const client = getApiClient();
        const response = await client.get(`/customers`, {
            params: { emailAddress: email }
        });
        console.log('Customer response:', response.data);
        // The API returns { customers: [...], pagination: {...} }
        const customers = response.data?.customers;
        if (Array.isArray(customers) && customers.length > 0) {
            // Return the first customer object
            return response.data.customers[0].customerId;
        } else {
            // No customer found for this email
            return null;
        }
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}

export const getCustomerPoints = async (id: string): Promise<Customer | null> => {
    try {
        const client = getApiClient();
        const response = await client.get(`/customers/${id}`);
        return response.data as Customer;
    } catch (error) {
        console.error('Error fetching customer points:', error);
        return null;
    }
}
