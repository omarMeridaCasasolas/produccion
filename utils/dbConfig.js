const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',  // Host de la base de datos
  user: 'root',  // Usuario de la base de datos
  dateStrings: true,
  password: '',  // Contraseña de la base de datos
  database: 'produccion'  // Nombre de la base de datos
});

// Conectarse a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos: ', error);
  } else {
    console.log('Conexión exitosa a la base de datos MySQL');
  }
});

// Exportar la conexión para usarla en otros módulos
module.exports = connection;