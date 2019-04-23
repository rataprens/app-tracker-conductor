import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { UsuarioProvider } from '../providers/usuario/usuario';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public _usuarioProv: UsuarioProvider) {
    //Cuando la plataforma esta cargada
    platform.ready().then(() => {
        //llamamos al servicio del usuario para cargar el storage
      _usuarioProv.cargarStorage().then(existe=>{
          
        statusBar.styleDefault();
        splashScreen.hide();

        //Si existe clave guardada
        if(existe){
            //Correcto, el root de la pag es HomePage
            this.rootPage = HomePage;
        }else{
            //Incorrecto, el root de la pag es LoginPage
          this.rootPage = LoginPage;
        }
      })
    });
  }
}

