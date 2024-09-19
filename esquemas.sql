CREATE TABLE base_datos.cargo_entidad (
  `cod_cargo_entidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `cod_entidad` int(11) NOT NULL,
  `cod_categorias` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`cod_categorias`)),
  PRIMARY KEY (`cod_cargo_entidad`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE base_datos.categoria (
  `cod_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(110) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `sexo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`cod_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE base_datos.entidad (
  `cod_entidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `nit` varchar(14) DEFAULT NULL,
  `info_contrato` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`cod_entidad`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;


CREATE TABLE base_datos.menu (
  `cod_menu` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(100) DEFAULT NULL,
  `route` varchar(100) DEFAULT NULL,
  `icono` varchar(10) DEFAULT NULL,
  `perfil` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`perfil`)),
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `visible` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`cod_menu`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

INSERT INTO base_datos.menu (label,route,icono,perfil,orden,activo,visible) VALUES
	 ('Ordenes de compra','ordenes-compra','lo','[2,3]',1,1,1),
	 ('Categorias','categorias','lo','[1]',2,1,1),
	 ('Productos','productos','lo','[1]',3,1,1),
	 ('Tallajes','tallajes','lo','[1]',4,1,1),
	 ('Entidades','entidades','lo','[1]',5,1,1),
	 ('Productos','producto','io','[2,3]',7,1,0),
	 ('Empty','empty','io','[2,3]',7,1,0),
	 ('Cart','cart','io','[2,3]',7,1,0),
	 ('Resumen Orden','resumen_orden','io','[2,3]',7,1,0),
	 ('Guia de uso','guia-uso','io','[3]',8,1,1),
	 ('Gestionar solicitud Dotación','solicitud-dotacion','io','[2]',9,1,1),
	 ('Control ordenes','control-ordenes','io','[2]',10,1,1),
	 ('Información Entidad','info-entidad','io','[2]',11,1,1);



CREATE TABLE base_datos.orden (
  `cod_orden` int(11) NOT NULL AUTO_INCREMENT,
  `cod_usuario` int(11) DEFAULT NULL,
  `productos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`productos`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `cod_usuario_creacion` int(11) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`cod_orden`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;


CREATE TABLE base_datos.perfil (
  `cod_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`cod_perfil`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

INSERT INTO base_datos.perfil (nombre,activo) VALUES
	 ('Administrador',1),
	 ('Coordinador Entidad',1),
	 ('Cliente Entidad',1);


CREATE TABLE base_datos.producto (
  `cod_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `cod_categoria` int(11) NOT NULL,
  `cod_tallaje` int(11) NOT NULL,
  `activo` tinyint(4) DEFAULT 0,
  `talla` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`talla`)),
  `tiene_talla` tinyint(4) DEFAULT 0,
  `tiene_color` tinyint(4) DEFAULT 0,
  `descripcion` longtext NOT NULL,
  PRIMARY KEY (`cod_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE base_datos.producto_color (
  `cod_producto_color` int(11) NOT NULL AUTO_INCREMENT,
  `color` varchar(100) DEFAULT NULL,
  `color_descripcion` varchar(100) DEFAULT NULL,
  `cod_producto` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`cod_producto_color`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE base_datos.producto_color_imagen (
  `cod_producto_color_imagen` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(150) DEFAULT NULL,
  `cod_producto_color` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`cod_producto_color_imagen`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;


CREATE TABLE base_datos.tallaje (
  `cod_tallaje` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `imagen` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`cod_tallaje`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE base_datos.usuario (
  `cod_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `cod_perfil` int(11) NOT NULL,
  `cod_entidad` int(11) DEFAULT NULL,
  `sexo` varchar(2) DEFAULT NULL,
  `cedula` varchar(100) DEFAULT NULL,
  `cod_cargo_entidad` int(11) DEFAULT NULL,
  PRIMARY KEY (`cod_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

INSERT INTO base_datos.usuario (email,nombre,password,activo,cod_perfil,cod_entidad,sexo,cedula,cod_cargo_entidad) VALUES
	 ('cristian.aragon@pysltda.com','Cristian Aragón','$2a$10$0SajEvYOrqnXwp3PryKPFe6bxUlkZQg3o4wUD0Z6R3HDZxET2AwmK',1,1,NULL,NULL,'1013661443',NULL),
	 ('cristian.aragon@pysltda.com','Admin','$2a$10$.u5C80GcjrOAMLnmq/TFr.yjHhc9.QwDUrcknS7J9vkrswzRYCu4e',1,1,NULL,NULL,'901474311',NULL);


CREATE TABLE base_datos.variable (
  `cod_variable` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `valor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`cod_variable`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

INSERT INTO base_datos.variable (nombre,valor) VALUES
	 ('JWT_EXPIRACION_EXTERNO','100d');