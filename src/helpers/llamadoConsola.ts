const { exec } = require('child_process');

export const realizarLlamadoConsola = async ( comando:string ) : Promise<{error:number, mensaje:string}>=>{

  return new Promise((resolve,reject)=>{
    exec( comando, (error:any, stdout:any, stderr:any) => {
      if (error) {
          resolve({
            error:1,
            mensaje:"Error al ejecutar comando de consola " + error
          })
      }

      resolve({
        error:0,
        mensaje:"Ejecutado correctamente"
      })
      console.log(`stdout: ${stdout}`)
  });

  })
}