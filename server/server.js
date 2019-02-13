var express = require('express');
var app  = express(); 
var http = require ( 'http' ).Server(app);
var io   = require ( 'socket.io')(http);

//Librerias para envio de emails
const bodyParser = require('body-parser');
const exphbs = require ('express-handlebars');
const path = require ('path');
const nodemailer = require( 'nodemailer');
var cors = require('cors');

app.use(cors());
// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get ( '/' , function ( req, res ) { 
   res.sendFile(__dirname + '/index.html');
});

//Middleware para manejo de correos
var sendingEmail = null;
app.post('/sendEmail',(req, res)=>{
   console.log(req.body);
   res.set('Content-Type', 'application/json');
   sendEmail(req.body.emailType,req.body.userData,req.body.Mailto);//envio de correos
});

//Middleware para la carga de archivos soporte


//Middleware para carga de foto perfil
app.post('file_atachment/',(req, res)=>{

});

/**
 * Function: sendEmail
 * Parameters: 
 *    emailType: Tipo de notificacion a enviar
 *       Type 1: Solicitud Contraseña (nombre,password)
 *       Type 2: Solicitud de vacaciones usuario (nombre, dias, fecha inicio, fecha fin y fecha regreso)
 *       Type 3: Solicitud de vacaciones a Lider (nombre, nombre empleado, dias, fecha inicio, fecha fin y fecha regreso )
 *       Type 4: Solicitud de incidencias usuario (nombre, dias, fecha inicio, fecha fin y motivo)
 *       Type 5: Solicitud de incidencia a Lider (nombre, nombre empleado, dias, fecha inicio, fecha fin y motivo)
 *       Type 6: Regreso Vacaciones (nombre)
 *       Type 7: Vencimiento Vacaciones (nombre, dias y fecha vencimiento)
 *       Type 8: Vacaciones Vencidas (nombre y dias)
 *       Type 9: Cambio de estado solicitud de vacaciones
 *       Type 10: Cambio de estado captura incidencia
 *    userData: objeto con los datos a incluir en el correo.
 *    Mailto: destinatario de email
 */
function sendEmail(emailType, userData, Mailto){
   var _reponse = null;
   const body = bodyEmail(emailType,userData);
   // create reusable transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
      user: 'notificaciones@itw.mx', // generated ethereal user
      pass: 'Zuy08210'  // generated ethereal password
      },
      tls: {
      rejectUnauthorized: false
      }
   });

   // setup email data with unicode symbols
   let mailOptions = {
      from: '"Notificaciones automáticas" <notificaciones@itw.mx>', // sender address
      to: Mailto, // list of receivers
      subject: emailType == 1 ? 'Recuperar contraseña acceso' :
               emailType == 2 ? 'Solicitud de Vacaciones Registrada' :
               emailType == 3 ? 'Nueva Solicitud de Vacaciones por admnistrar' :
               emailType == 4 ? 'Captura de una incidencia exitosa' :
               emailType == 5 ? 'Nueva incidencia por administrar' ://(emailType==1)?'INTRANET Recuperar Contraseña':'Notificaciones',//'Notificaciones', // Subject line // EmailSubject Asunto del correo
               emailType == 9 ? 'Actualización de estado Solicitud Vacaciones' :
               emailType == 10 ? 'Actualización de estado Incidencia':'Notificaciones',
      /*attachments: [{
         filename: 'MailSign.jpg',
         path: './server/public/assets/MailSign.jpg',
         cid: 'Mail'
      }],*/
      html: body // html body
   };

   // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         responseSendingEmail(error);
      } else {
         var d = {status: 200,'description':'email send','info':info.id};
         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
         responseSendingEmail(info);
      }
   });
}

function responseSendingEmail(data){
   sendingEmail = data;
}

function bodyEmail(tipoEmail,userData){
   var output = '';
   switch(tipoEmail){
      case 1: //Solicitud Contraseña
         /*output = `
         <div style="position: relative; display: inline-block; text-align: center;">
            <img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg" />
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Texto</div>
         </div>
         <p style="position: absolute; top: 100px; left: 100px;">Hola ${userData.name}:</p><br>
         <ul>  
         Tu contraseñas para acceder a la página <a href="http://intranet.itw.mx" >intranet.itw.mx</a> es :<br>
               <br><br><strong>${userData.password}</strong>
         </ul><br><br> 
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         `;*/
         output = `
         <center>
	      <table border="0px" width="500px">
  	         <tr>
    		      <td><img src="EmailTemplate Head.png"  width="500px"></td>
  	         </tr>
  	         <tr>
    		      <td><p><br><blockquote>Hola ${userData.name}:</p><br>
			         <ul> 
				         Tu contraseñas para acceder a la página <br><a href="http://intranet.itw.mx" >intranet.itw.mx</a> es : 
				         <strong>${userData.password}</strong>
			         </ul><br>
		         </td>
  	         </tr>
	      </table>
	      <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
	      <br>
	      <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
	      </center>
         `;
         break;
      case 2://Solicitud de vacaciones usuario
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Vacaciones.png"  width="500px"></td>
           </tr>
           <tr>
                <td><p><br><blockquote>Hola ${userData.name}:</p><br>
               <p>Te notificamos que tu solicitud de vacaciones se ha registrado exitosamente y se ha enviado a tu Líder para su aprobación.<br>
                        En cuanto sea validada se te enviará una notificación por este mismo medio.</p>
                     <strong>Detalle de solicitud:</strong><br>
               <ul TYPE="none"> 
                  <li><strong>Dias solicitados: </strong>${userData.dias}</li>
                           <li><strong>Del: </strong>${userData.fecha_ini} <strong> Al: </strong>${userData.fecha_fina}</li>
                           <li><strong>Regreso a labores: </strong>${userData.fecha_regreso}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
      case 3://Solicitud de vacaciones a Lider
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Vacaciones.png"  width="500px"></td>
           </tr>
           <tr>
                <td><p><br><blockquote>Hola,</p><br>
               <p>Te notificamos que se a registrado una nueva solicitud de vacaciones por parte de: <strong>${userData.name}.</strong><br>
                        Te invitamos a revisarla lo más pronto posible en la intranet <a href="http://intranet.itw.mx" >intranet.itw.mx</a>.</p>
               <strong>Detalle de solicitud:</strong><br>
               <ul type="none"> 
                  <li><strong>Dias solicitados: </strong>${userData.dias}</li>
                           <li><strong>Del: </strong>${userData.fecha_ini}<strong> Al: </strong>${userData.fecha_fina}</li>
                           <li><strong>Regreso a labores: </strong>${userData.fecha_regreso}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
      case 4://Solicitud de incidencias usuario
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Incidencias.png"  width="500px"></td>
           </tr>
           <tr>
                <td><p><br><blockquote>Hola ${userData.name}:</p><br>
               <p>Te notificamos que tu solicitud de incidencias se ha registrado exitosamente y se ha enviado a tu Líder para su aprobación.<br>
                        En cuanto sea validada se te enviará una notificación por este mismo medio.</p>
               <strong>Detalle de solicitud:</strong><br>
               <ul TYPE="none">
                  <li><strong>Dias solicitados: </strong>${userData.dias}</li>
                           <li><strong>Del: </strong>${userData.fecha_ini}<strong> Al: </strong>${userData.fecha_fina}</li>
                           <li><strong>Motivo: </strong>${userData.motivo}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
      case 5://Solicitud de incidencia a Lider
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Incidencias.png"  width="500px"></td>
           </tr>
           <tr>
                <td><p><br><blockquote>Hola,</p><br>
               <p>Te notificamos que se a registrado una nueva solicitud de incidencia por parte de: <strong>${userData.name}.</strong><br>
                        Te invitamos a revisarla lo más pronto posible en la intranet <a href="http://intranet.itw.mx" >intranet.itw.mx</a>.</p>
                     <strong>Detalle de solicitud:</strong><br>
               <ul type="none">
                  <li><strong>Dias solicitados: </strong>${userData.dias}</li>
                           <li><strong>Del: </strong>${userData.fecha_ini}<strong> Al: </strong>${userData.fecha_fina}</li>
                           <li><strong>Motivo: </strong>${userData.motivo}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
      case 6: //Regreso Vacaciones
         output = `
         <p>¡Bienvenido de nuevo ${userData.name}!</p>
         <ul>  
            Estamos muy felices de tenerte de vuelta en ITW. Todos te hemos extrañado, y los clientes han estado ansiosos por tu regreso. Esperamos que disfrutaras al máximo tus vacaciones.
         </ul><br><br>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         `;
      case 7:  //Vencimiento Vacaciones
         output = `
         <p>Hola ${userData.name}:</p>
         <ul>  
            Te notificamos que tus <strong>${userData.dias}</strong> días de Vacaciones vencerán el día: <strong>${userData.fecha}.</strong><br>
            Te sugerimos ir planificándolos para evitar que se pierdan.
         </ul><br><br> 
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         `;
      case 8://Vacaciones Vencidas
         output = `
         <p>Hola ${userData.name}:</p>
         <ul>
            Lamentamos informarte pero tus <strong>${userData.dias}</strong> días de Vacaciones han <strong>Vencido</strong>, te recomendamos planees con anticipación tus vacaciones de posteriores años.
         </ul><br><br>
         <p><strong>Nota: </strong>Cualquier duda favor de revisarlo con tú líder.</p> 
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         `;
         break;
      case 9://Estado de Vacaciones
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Vacaciones.png"  width="500px"></td>
           </tr>
           <tr>
            <td><p><br><blockquote>Hola ${userData.name}:</p><br>
               <p>Te notificamos que tu solicitud de vacaciones ya ha sido revisada por tu lider.</p>
                     <strong>Detalle de solicitud:</strong><br>
               <ul TYPE="none">
                  <li><strong>NUEVO ESTADO DE TU SOlICITUD </strong>${userData.estado}</li>
                  <li><strong>Dias solicitados: </strong>${userData.dias}</li>
                  <li><strong>Del: </strong>${userData.fecha_ini} <strong> Al: </strong>${userData.fecha_fina}</li>
                  <li><strong>Regreso a labores: </strong>${userData.fecha_regreso}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
         case 10://Solicitud de incidencias usuario
         output = `
         <center>
         <table border="0px" width="500px">
           <tr>
                <td><img src="EmailTemplate Head Incidencias.png"  width="500px"></td>
           </tr>
           <tr>
            <td><p><br><blockquote>Hola ${userData.name}:</p><br>
               <p>Te notificamos que tu incidencia ya ha sido revisada por tu lider.</p>
                  <strong>Detalle de la incidencia:</strong><br>
               <ul TYPE="none">
                  <li><strong>NUEVO ESTADO DE TU INCIDENCIA </strong>${userData.estado}</li>
                  <li><strong>Dias: </strong>${userData.dias}</li>
                  <li><strong>Del: </strong>${userData.fecha_ini} <strong> Al: </strong>${userData.fecha_fina}</li>
               </ul><br>
            </td>
           </tr>
         </table>
         <h5>Favor de no replicar este mensaje, Mensaje generado Automáticamente</h5></td>
         <br>
         <p><img src="http://intranet.dev.itw.mx/src/assets/MailSign.jpg"></p>
         </center>
         `;
         break;
   }
   return output;
}


//Array de users conectados
var app_user = [];
var sessionUser = false;
//Nuestro primer Socket 
io.sockets.on('connection',function(socket){
   //cuando el usuario se conecte
   socket.on('login_user',function(user){
      console.log(`================== ${Object.keys(app_user).length} ==============================`);
      console.log(`nueva solicitud de acceso: id: ${socket.id} user: ${user.username}`);
      //buscamos el nuevo usario dentro de los sockets conectados
      var sessionExist = app_user.findIndex(usuario => usuario.username === user.username);
      console.log(sessionExist);
      if(sessionExist < 0){
         //Si el usario no existe lo añadimos
         console.log(`Array antes de agregar elementos: ${JSON.stringify(app_user)}`);
         app_user.push({id:socket.id,username:user.username});
         console.log(`Array despues de agregar elementos: ${JSON.stringify(app_user)}`);
         sessionUser = false;
      }else{
         //Cambiamos la bandera para indicar que ya existe una sesion.
         sessionUser = true; 
      }
      //enviamos la respuesta de validar una sesion de usuario
      socket.emit('login',{"session": sessionUser});    
      console.log("sesion anterior?: " + sessionUser);
      console.log(app_user);
      console.log("================================================================="); 
   });

   //Para casos donde cierra su sesion sin cerrar el navegador
   socket.on('destroySesion',function(user){
      console.log('======== Finalizando Session ==============');
      //Eliminamos el registro de sesion del array
      console.log(`Array antes de eliminar elemento: ${JSON.stringify(app_user)}`);
      let index = app_user.findIndex(usuario => usuario.username === user.username );
      console.log('index: ' + index);
      app_user.splice(index,1);
      console.log(`Array despues de eliminar elemento: ${JSON.stringify(app_user)}`);
      console.log('===========================================');
   });

   //cuando el usuario se desconecte
   socket.on('disconnect',function(){
      var sessionExist = app_user.find(usuario => usuario.id === socket.id);
      if(sessionExist != undefined){
         //Eliminamos el registro de sesion del array
         console.log(`Array antes de eliminar elemento: ${JSON.stringify(app_user)}`);
         let index = app_user.findIndex(usuario => usuario.id === socket.id);
         console.log('index: ' + index);
         app_user.splice(index,1);
         console.log(`Array despues de eliminar elemento: ${JSON.stringify(app_user)}`);
      }
   });
});

var port = 3000;
var hostname = '0.0.0.0';
console.log(`port: ${port} ip: ${hostname}`);
//Indicamos a app el puerto a escuchar
http.listen (port,hostname, () => { 
   console.log(`App listening to http://${hostname}:${port}/`);
   console.log('Press Ctrl+C to quit.');
});
