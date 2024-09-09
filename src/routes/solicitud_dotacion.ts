import dotenv from 'dotenv';
import express from 'express';
import * as solicitudDotacionService from '../services/solicitud_dotacion';

dotenv.config();

export const router = express.Router();

router.get('/ordenes_pendientes', solicitudDotacionService.obtenerOrdenesPendientes);