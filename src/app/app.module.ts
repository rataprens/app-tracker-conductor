import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

//Componentes y servicios
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { UsuarioProvider } from '../providers/usuario/usuario';
import { UbicacionProvider } from '../providers/ubicacion/ubicacion';

//Modulos de AngularFirebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

//Archivo de config para FireBase
import { firebaseConfig } from '../config/firebase.config';

//Plugin del storage
import { IonicStorageModule } from '@ionic/storage';

//Plugin de Geolocalizacion
import { Geolocation } from '@ionic-native/geolocation';

//Plugin de google maps
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    IonicStorageModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCNrSxTaaXtAZy3Wtucs6voOjCxJGpuujM'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UsuarioProvider,
    UbicacionProvider,
    Geolocation
  ]
})
export class AppModule {}
