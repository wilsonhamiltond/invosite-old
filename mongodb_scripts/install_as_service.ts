var Service = require('node-windows').Service

// Create a new service object
try{
  var svc = new Service({
    name:'IS_INSTANCE_NAME',
    description: 'Sistema de gestion de prestamos modo Insance_name',
    script: `${process.cwd()}/dist/server.bundle.js`,
    env: {
      name: "NODE_ENV",
      value: 'ENVIROMENT'
    }
  });

  svc.on('install', ()=>{
    svc.start();
    console.log("Servicio instalado correctamente")
  });

  svc.install()
}catch(e){
  console.log(e)
  process.exit(0)
}