const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection  = require('./utils/dbConfig');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = 3000;

app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const secretKey = 'miClaveSecreta123';
app.set('view engine', 'ejs');

// PAGES 
app.get('/', function(req, res) {
    console.log('aqu');
    res.render('pages/index');
});

app.get('/personal', function(req, res) {
    res.render('pages/personal');
});

app.get('/articulo', function(req, res) {
    res.render('pages/articulo');
});

app.get('/proveedor', function(req, res) {
    res.render('pages/proveedor');
});

app.get('/tela', function(req, res) {
    res.render('pages/tela');
});

app.get('/rollo', function(req, res) {
    res.render('pages/rollo');
});

app.get('/empleado', function(req, res) {
    res.render('pages/empleado');
});

app.get('/compraTela', function(req, res) {
    res.render('pages/compraTela');
});

app.get('/cortado', function(req, res) {
    res.render('pages/cortado');
});

app.get('/corte', function(req, res) {
    res.render('pages/corte');
});



// API;
app.post('/api/login',(req, res) => {
    const data = req.body; // Accede a los datos enviados en el cuerpo de la solicitud
    const query = `SELECT * FROM personal WHERE UPPER(usuario_personal) = UPPER(?) AND UPPER(password_personal) = UPPER(?);`;
    connection.query(query, [data.email,data.password], (error, results) => {
        if (error) {
            console.log(error);
            res.json({ error });
        }else{
            if(results.length === 0){
                res.json({estado:'Correo o contraseña invalido!!'});
            }else{
                let personal = results[0];
                // res.json();
                // console.log(data);
                let data  = { personal:personal.nombre_personal, identificador: personal.id_personal, cargo: personal.tipo_personal };
                // let token = jwt.sign(data, secretKey, { expiresIn: '2h' });
                jwt.sign({ data }, secretKey, { expiresIn: '2h' }, (err, token) => {
                    if (err) {
                        res.status(500).json({ error: 'Error al generar el token' });
                    } else {
                        // Envía el token en la respuesta
                        console.log('se ha generado token');
                        res.json({ token });
                    }
                });
                // res.json({ token });
            }
        }
    });    
});

app.get('/api/personal',(req, res) => {
    connection.query(`SELECT id_personal AS Id, nombre_personal AS Nombre, celular_personal AS Celular, usuario_personal AS Usuario, 
    tipo_personal AS Tipo, estado_personal AS Estado, id_personal AS Opcion FROM personal;`, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.json({ error });
        }else{
            res.json(results);
        }
    });    
});

app.get('/api/articulo',(req, res) => {
    connection.query(`SELECT id_articulo AS Id, nombre_articulo AS Nombre, detalle_articulo AS Detalle, tipo_articulo AS Tipo, 
    precio_unidad_articulo AS Precio, cantidad_articulo AS Cantidad, estado_articulo AS Estado, id_articulo AS Opcion FROM articulo;`, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.json({ error });
        }else{
            res.json(results);
        }
    });    
});

// PROVEEDOR 
app.get('/api/proveedor',(req, res) => {
    connection.query(`SELECT id_proveedor AS Id, nombre_proveedor AS Nombre, celular_proveedor AS Celular, detalle_proveedor AS Detalle, 
    tipo_proveedor AS Tipo, estado_proveedor AS Estado, id_proveedor AS Opcion FROM proveedor;`, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.json({ error });
        }else{
            res.json(results);
        }
    });    
});

app.get('/api/proveedoresDisponibles',(req, res) => {
    try {
        connection.query(`SELECT id_proveedor AS id, nombre_proveedor AS nombre FROM proveedor WHERE estado_proveedor = 1;`, (error, results, fields) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json(results);
            }
        });   
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }   
});


// TELA 
app.get('/api/tela',(req, res) => {
    connection.query(`SELECT id_tela AS Id, codigo_tela AS Codigo, nombre_tela AS Nombre , tipo_tela AS Tipo, valor_metro_tela AS Valor, metraje_tela AS Metraje,
    estado_tela AS Estado, id_tela AS Opcion FROM tela;`, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.json({ error });
        }else{
            res.json(results);
        }
    });    
});

app.post('/api/tela',(req, res) => {
    let data = req.body; 
    console.log(data);
    let query = `INSERT INTO tela(codigo_tela,nombre_tela,tipo_tela,valor_metro_tela,estado_tela,metraje_tela) VALUES(?,?,?,?,?,?);`;
    connection.query(query, [data.codigo,data.nombre,data.tipo,data.valor,data.estado,data.metraje], (error, results) => {
        if (error) {
            console.log(error);
            res.json({ "Error":error.sqlMessage });
        }else{
            res.json({"estado":"Agregado","id":results.insertId });
        }
    });    
});

app.delete('/api/tela/:id',(req, res) => {
    try {
        let idTela = req.params.id;
        const query = 'DELETE FROM tela WHERE id_tela = ?';
        connection.query(query, [idTela], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ "Error":error.sqlMessage });
            }else{
                res.json({estado:"Eliminado",resultado:results.affectedRows});
            }
        });     
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }  
});

app.get('/api/telasDisponibles',(req, res) => {
    try {
        connection.query(`SELECT id_tela AS id, codigo_tela AS codigo, nombre_tela AS nombre , tipo_tela AS Tipo, metraje_tela AS Metraje,
        id_tela AS Opcion FROM tela WHERE estado_tela = 1;`, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json(results);
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

// COMPRA TELA 
app.get('/api/compraTela',(req, res) => {   
    try {
        let query = `SELECT id_compra_tela AS Id,fecha_compra_tela AS Fecha, id_personal, nombre_personal AS Personal, id_proveedor, nombre_proveedor AS Proveedor, precio_compra_tela AS Precio, 
        efectivo_compra_tela AS Efectivo, digital_compra_tela AS Digital, qr_compra_tela ,pago_compra_tela, COUNT(id_tela) AS Telas, id_compra_tela AS Opcion 
        FROM compra_tela INNER JOIN compra_tela_detalle USING(id_compra_tela) INNER JOIN personal USING(id_personal) INNER JOIN proveedor USING(id_proveedor) GROUP BY(id_compra_tela);`
        connection.query(query, (error, results, fields) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json(results);
            }
        });      
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }  
});

// ROLLO
app.get('/api/rollo',(req, res) => {
    try {
        connection.query(`SELECT id_rollo AS id,id_tela,codigo_tela,nombre_tela AS tela,id_proveedor,nombre_proveedor AS proveedor, codigo_rollo,detalle_rollo AS detalle,altura_cm_rollo AS altura,
        ancho_cm_rollo AS ancho,metraje_rollo AS metraje, precio_rollo AS precio, estado_rollo AS estado FROM 
        rollo INNER JOIN tela USING(id_tela) INNER JOIN proveedor USING(id_proveedor);`, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json({data:results});
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.get('/api/cortadoRollo/:id',(req, res) => {
    try {
        let idCortado = req.params.id;
        let query = `SELECT id_cortado, nombre_tela AS tela, tipo_tela AS tipo, id_rollo,detalle_rollo AS detalle, CONCAT(altura_cm_rollo," X ",ancho_cm_rollo) AS dimension, codigo_rollo AS codigo, metraje_cortado_rollo AS metraje 
        FROM rollo INNER JOIN cortado_rollo USING(id_rollo) INNER JOIN tela USING(id_tela) WHERE id_cortado = ?;`;
        connection.query(query, [idCortado], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json(results);
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.post('/api/rollo',(req, res) => {
    try {
        let data = req.body; 
        // console.log(data);
        let query = `INSERT INTO rollo(id_tela,id_proveedor,codigo_rollo,detalle_rollo,altura_cm_rollo,ancho_cm_rollo,metraje_rollo,precio_rollo,estado_rollo) VALUES(?,?,?,?,?,?,?,?,?);`;
        connection.query(query, [data.tela,data.proveedor,data.codigo,data.detalle,data.alto,data.ancho,data.metraje,data.precio,data.estado], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ "estado":error.sqlMessage });
            }else{
                res.json({"estado":"Agregado"});
            }
        });          
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.delete('/api/rollo/:id',(req, res) => {
    try {
        let idRollo = req.params.id;
        const query = 'DELETE FROM rollo WHERE id_rollo = ?';
        connection.query(query, [idRollo], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ "Error":error.sqlMessage });
            }else{
                res.json({estado:"Eliminado"});
            }
        });     
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }  
});

app.get('/api/getRollosDisponibles',(req, res) => {
    try {
        let query = `SELECT id_rollo AS id, codigo_rollo AS codigo, nombre_tela AS tela, tipo_tela AS tipo, detalle_rollo AS detalle, altura_cm_rollo AS altura, ancho_cm_rollo AS ancho, 
        resto_rollo AS resto FROM rollo INNER JOIN tela USING(id_tela) WHERE resto_rollo > 0 AND estado_rollo = 1;`;
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json({data:results});
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

// EMPLEADO 
app.get('/api/empleado',verificarToken,(req, res) => {
    try {
        connection.query(`SELECT id_empleado AS id,nombre_empleado AS nombre, celular_empleado AS celular,usuario_empleado AS usuario, 
        password_empleado AS password, tipo_empleado AS tipo,estado_empleado AS estado FROM empleado;`, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json({data:results});
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.post('/api/empleado',verificarToken,(req, res) => {
    try {
        let data = req.body; 
        let query = `INSERT INTO empleado(nombre_empleado,celular_empleado,usuario_empleado,password_empleado,tipo_empleado,estado_empleado) VALUES(?,?,?,?,?,?);`;
        connection.query(query, [data.nombre,data.celular,data.usuario,data.password,data.tipo,data.estado], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ "estado":error.sqlMessage });
            }else{
                res.json({"estado":"Agregado"});
            }
        });          
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.delete('/api/empleado/:id',(req, res) => {
    try {
        let idEmpleado = req.params.id;
        const query = 'DELETE FROM empleado WHERE id_empleado = ?';
        connection.query(query, [idEmpleado], (error, results) => {
            if (error) {
                console.log(error);
                res.json({ "Error":error.sqlMessage });
            }else{
                res.json({estado:"Eliminado"});
            }
        });     
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }  
});

//CORTADOR
app.get('/api/cortado',(req, res) => {
    try {
        let query = `SELECT id_cortado AS id, id_personal,nombre_personal AS personal, id_empleado, nombre_empleado AS empleado, fecha_cortado AS fecha,cantidad_estimado_cortado AS estimado,
        cantidad_entregada_cortado AS entregado, metraje_entregado AS metraje, estado_cortado AS estado_cortado FROM cortado INNER JOIN personal USING(id_personal) INNER JOIN empleado USING(id_empleado)`;
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json({data:results});
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.post('/api/cortado',verificarToken,(req, res) => {
    try {
        let data = req.body; 
        let telasCortar = [];
        let metrajeTotal = 0.0;
        for (let key in data) {
            if (key.startsWith('IdCant_')) {
                let x = data[key];
                metrajeTotal += parseFloat(x);
                let arr = key.split('_');
                let obj = {idRollo: arr[1], metraje: x}
                telasCortar.push(obj);
            }
        }
        let query = `INSERT INTO cortado(id_personal,id_empleado,cantidad_estimado_cortado,metraje_entregado) VALUES(?,?,?,?)`;
        connection.query(query,[data.id_personal,data.cortador,data.estimacion,metrajeTotal] ,(error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                // res.json({data:results});
                let query = `CALL asignarRolloCortador(?,?,?)`;
                for (let index = 0; index < telasCortar.length; index++) {
                    let element = telasCortar[index];
                    connection.query(query,[results.insertId,element.idRollo,element.metraje] ,(error, resultados) => {
                        if (error) {
                            console.log(error);
                            res.json({ error });
                        }
                    }); 
                }
                res.json({"estado":"Agregado"});

            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

//COTADOR
app.get('/api/cortador',(req, res) => {
    try {
        let query = `SELECT id_empleado AS id, nombre_empleado AS cortador, estado_empleado AS estado FROM empleado WHERE tipo_empleado = 'Cortador';`;
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                res.json(results);
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

//CORTE
app.get('/api/corte',(req, res) => {
    try {
        let query = `SELECT id_corte AS id,IFNULL(nombre_empleado, "No Existe") AS empleado,IFNULL(nombre_personal, "No Existe") AS personal, codigo_corte AS codigo, detalle_corte AS detalle,
        talla_corte AS talla, metraje_inicio_corte AS metraje_inicio, metraje_actual_corte AS metraje_actual, cantidad_inicio_corte AS cantidad_inicio, 
        cantidad_actual_corte AS cantidad_actual, estado_corte FROM corte LEFT JOIN empleado USING(id_empleado) LEFT JOIN personal USING(id_personal);`;
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error);
                res.json({ error });
            }else{
                // res.json(results);
                res.json({data:results});
            }
        });    
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.post('/api/cortadosEntregados',(req, res) => {
    try {
        let data = req.body; 
        let cortesObtenidos = [];
        for (let key in data) {
            let x = data[key];
            if (key.startsWith('codigoAddCorte_')) {
                // console.log(key,x,cortesObtenidos);
                agregarCodigoCorte(key,x,cortesObtenidos);
                continue;
            }
            if (key.startsWith('detalleAddCorte_')) {
                // console.log(key,x,cortesObtenidos);
                agregarDetalleCorte(key,x,cortesObtenidos);
                continue;
            }
            if (key.startsWith('tallasAddCorte_')) {
                // console.log(key,x,cortesObtenidos);
                agregarTallaCorte(key,x,cortesObtenidos);
                continue;
            }
            if (key.startsWith('metrajeAddCorte_')) {
                // console.log(key,x,cortesObtenidos);
                agregarMetrajeCorte(key,x,cortesObtenidos);
                continue;
            }
            if (key.startsWith('cantidadAddCorte_')) {
                // console.log(key,x,cortesObtenidos);
                agregarCantidadCorte(key,x,cortesObtenidos);
                continue;
            }

        }
        // res.json(cortesObtenidos);
        let query = `INSERT INTO corte(codigo_corte,detalle_corte,talla_corte,metraje_inicio_corte,metraje_actual_corte,cantidad_inicio_corte,cantidad_actual_corte,estado_corte) VALUES(?,?,?,?,?,?,?)`;
        cortesObtenidos.forEach(x=>{
            connection.query(query,[x.codigo,x.detalle,x.talla,x.metraje,x.metraje,x.cantidad,x.cantidad,'Revision'] ,(error, results) => {
                if (error) {
                    console.log(error);
                    res.json({ error });
                }
                // results.affectedRows
            });   
        });
        res.json({"estado":"Agregado"});
    } catch (error) {
        console.error('Se produjo un error:', error);
        res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    try {
        let payload = jwt.verify(token, secretKey);
        // console.log(payload);
        req.body.id_personal = payload.data.identificador;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
}

function agregarCodigoCorte(key,x,cortesObtenidos){
    let i = 0;
    let bandera = true;
    let dato = key.split('_');
    let id = dato[1];
    while (i<cortesObtenidos.length && bandera) {
        if(cortesObtenidos[i].id == id){
            cortesObtenidos[i]['codigo'] = x;
            bandera = false;
        }
        i++;
    }
    if(bandera){
        let obj = {id:dato[1],codigo:x}
        cortesObtenidos.push(obj);
    }
}

function agregarDetalleCorte(key,x,cortesObtenidos){
    let i = 0;
    let bandera = true;
    let dato = key.split('_');
    let id = dato[1];
    while (i<cortesObtenidos.length && bandera) {
        if(cortesObtenidos[i].id == id){
            cortesObtenidos[i]['detalle'] = x;
            bandera = false;
        }
        i++;
    }
    if(bandera){
        let obj = {id:dato[1],detalle:x}
        cortesObtenidos.push(obj);
    }
}


function agregarTallaCorte(key,x,cortesObtenidos){
    let i = 0;
    let bandera = true;
    let dato = key.split('_');
    let id = dato[1];
    while (i<cortesObtenidos.length && bandera) {
        if(cortesObtenidos[i].id == id){
            cortesObtenidos[i]['talla'] = x;
            bandera = false;
        }
        i++;
    }
    if(bandera){
        let obj = {id:dato[1],talla:x}
        cortesObtenidos.push(obj);
    }
}

function agregarMetrajeCorte(key,x,cortesObtenidos){
    let i = 0;
    let bandera = true;
    let dato = key.split('_');
    let id = dato[1];
    while (i<cortesObtenidos.length && bandera) {
        if(cortesObtenidos[i].id == id){
            cortesObtenidos[i]['metraje'] = x;
            bandera = false;
        }
        i++;
    }
    if(bandera){
        let obj = {id:dato[1],metraje:x}
        cortesObtenidos.push(obj);
    }
}

function agregarCantidadCorte(key,x,cortesObtenidos){
    let i = 0;
    let bandera = true;
    let dato = key.split('_');
    let id = dato[1];
    while (i<cortesObtenidos.length && bandera) {
        if(cortesObtenidos[i].id == id){
            cortesObtenidos[i]['cantidad'] = x;
            bandera = false;
        }
        i++;
    }
    if(bandera){
        let obj = {id:dato[1],cantidad:x}
        cortesObtenidos.push(obj);
    }
}
