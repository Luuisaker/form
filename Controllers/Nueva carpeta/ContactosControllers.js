﻿const express = require('express');
let mysql = require("mysql");
const axios = require('axios');
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
        user: "test009@arodu.dev",
        pass: "eMail.test009",
    }
});
let apiUrl = "https://api.ip2location.io/?key=BB8E1959C6193AE184F8216D197A1C3A&ip=186.92.86.3";
const recaptchaSecretKey = '6LeC6vQpAAAAAF3Pfc3dgGUpUDmvghdLywG4AeW7';
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
let conection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "formulario"
});
router.post('/register', (req, res) => {
    let datos = req.body;
    let name = datos.name;
    let email = datos.email;
    let coment = datos.coment;
    const currentDate = new Date();
    const date = currentDate.toLocaleString();
    const recaptchaResponse = req.body['g-recaptcha-response'];



async function verifyRecaptcha(recaptchaResponse) {
    const secretKey = recaptchaSecretKey; // 
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
            secret: secretKey,
            response: recaptchaResponse
        });
        return response;
        if (recaptchaResponse) {
            verifyRecaptcha(recaptchaResponse)
                .then((response) => {
                    if (response.data.success) {
                        // reCAPTCHA verification successful
                        //... your form processing logic here 

                        res.send('Registration successful'); // Or send an appropriate response
                    } else {
                        res.status(400).send('reCAPTCHA verification failed');
                    }
                })
                .catch((error) => {
                    console.error('Error verifying reCAPTCHA:', error);
                    res.status(500).send('Internal server error');
                });
        } else {
            res.status(400).send('reCAPTCHA response missing');
        }
    } catch (error) {
        throw error;
    }
}
    if (!name || name.length <= 0) {
        res.send(`
    <script>
      alert("Debe colocar un nombre!");
      window.history.back();
    </script>
  `);
    }
    if (!email || email.length <= 0) {
        res.send(`
    <script>
      alert("Debe colocar un correo electrónico!");
      window.history.back();
    </script>`);
    }
    else {
        axios.get(apiUrl)
            .then(response => {
                const { country_name, ip } = response.data;
                const locacion = country_name;
                const ip_adress = ip;
                const nuevoregistro = "INSERT INTO datos(`Nombre`, `Correo`, `Comentario`, `IP`, `Fecha`, `Locacion`) VALUES('" + name + "', '" + email + "', '" + coment + "','" + ip_adress + "','" + date + "','" + locacion + "')";
                conection.query(nuevoregistro, function (error, rows) {
                    if (error) {
                        throw error;
                    } else {
                        res.send(`
    <script>
      alert("Registro Completado!");
      window.history.back();
    </script>`);
                        let mailOptions = {
                            from: 'test009@arodu.dev',
                            to: ``,
                            subject: 'Nuevo registro',
                            text: `Nuevo registro:\nNombre: ${name}\nCorreo: ${email}\nComentario: ${coment}\nIP: ${ip_adress}\nFecha: ${date}\nLocación: ${locacion}`
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Email sent: ' + info.response);
                        });
                    }
                });
            });
    }
});
module.exports = router