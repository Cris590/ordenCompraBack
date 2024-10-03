const fs = require('fs');
const path = require('path');

// Ruta del archivo JSON
const filePath = path.join(process.cwd(), `credenciales.json`)

class PasswordManager {
    private credentials: { [key: string]: string };
    constructor() {
        this.credentials = this.leerCredenciales();
    }

    // Leer el archivo JSON que contiene las credenciales
    leerCredenciales() {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } else {
            return {};
        }
    }

    // Guardar las credenciales en el archivo JSON
    guardarCredenciales() {
        fs.writeFileSync(filePath, JSON.stringify(this.credentials, null, 2));
    }

    // Obtener la contraseña de un usuario
    obtenerPassword(usuario:string) {
        return this.credentials[usuario] || '';
    }

    // Establecer una nueva contraseña o modificarla
    establecerPassword(usuario:string, password:string) {
        this.credentials[usuario] = password;
        this.guardarCredenciales();
    }

    // Eliminar las credenciales de un usuario
    eliminarPassword(usuario:string) {
        delete this.credentials[usuario];
        this.guardarCredenciales();
    }
}
export default PasswordManager;