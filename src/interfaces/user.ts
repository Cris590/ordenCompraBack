
export interface IUser {
  cod_usuario?: number;
  email: string;
  nombre:string;
  cedula?:string;
  password?:string;
  activo?:number;
  cod_perfil:number;
  cod_entidad?:number;
  sexo:string;
  cod_cargo_entidad:number
}

export interface IUserRole {
  userRoleId?: number;
  role: number;
  user: number;
}

export interface IRole {
  roleId?: number;
  name: string;
  active: number;
}

export interface IMenuChild {
  cod_menu: number;
  icono:string;
  label: string;
  route:string;
}