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

const secretKey = 'miClaveSecreta';
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

app.get('/compraTela', function(req, res) {
    res.render('pages/compraTela');
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
                let token = jwt.sign(data, secretKey, { expiresIn: '2h' });
                res.json({ token });
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

app.get('/api/proveedor',verificarToken,(req, res) => {
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    let payload;
    try {
        payload = jwt.verify(token, secretKey);
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
}