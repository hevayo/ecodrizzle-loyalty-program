import express from 'express'
import { ApiResponse, Transaction } from '../types'
import { getCustomerByIdByEmail, getCustomerPoints } from '../services/customerAPI'
import { get } from 'axios'

const router = express.Router()



const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    type: 'earn',
    amount: 150,
    description: 'Social media post about our new product',
    source: 'social_media',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    userId: '1',
    type: 'spend',
    amount: 500,
    description: 'Redeemed $5 gift card',
    source: 'reward',
    timestamp: '2024-01-18T14:15:00Z',
    status: 'completed',
  },
]

// Get points balance
router.get('/balance', async (req, res) => {
  const jwtAssertion = req.header('X-JWT-Assertion');

  if (!jwtAssertion) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const jwtPayload: any = jwtToJson(jwtAssertion);
  console.log('JWT Payload:', jwtPayload);

  //const email: string | null = "priyanga8312@gmail.com";
  const email: string = jwtPayload.email;

  console.log('Email from JWT:', email);

  if (!email) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const customerId = await getCustomerByIdByEmail(email);
  if (!customerId) {
    return res.status(404).json({ error: 'Customer not found with email: ' + email });
  }

  const points = await getCustomerPoints(customerId);
  res.json(points);
})

// Get transaction history
router.get('/transactions', (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const start = (page - 1) * limit

  const paginatedTransactions = mockTransactions.slice(start, start + limit)

  const response: ApiResponse<Transaction[]> = {
    success: true,
    message: 'Transactions retrieved successfully',
    data: paginatedTransactions,
    timestamp: new Date().toISOString()
  }
  res.json(response)
})


function jwtToJson(token: string): any | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}


export default router