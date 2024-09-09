import { Request, Response } from 'express';

export interface RequestToken extends Request{
    auth:TokenAuth
}

export interface TokenAuth {
    user: User;
    iat:  number;
    exp:  number;
}

export interface User {
    cod_usuario:       number;
    email:             string;
    nombre:            string;
    activo:            number;
    cod_perfil:        number;
    cod_entidad:       number;
    sexo:              string;
    cedula:            string;
    cod_cargo_entidad: number;
    entidad:           string;
    nit:               string;
}