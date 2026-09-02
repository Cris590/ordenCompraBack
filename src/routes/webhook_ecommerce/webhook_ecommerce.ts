import dotenv from 'dotenv';
import express from 'express';
import * as webhookEcommerceService from '../../services/webhook_ecommerce/webhook_ecommerce';

dotenv.config();

export const router = express.Router();

router.post('/order', webhookEcommerceService.procesarPedidoWooCommerce);