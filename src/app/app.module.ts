import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, FabContainer } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';



//Componentes y servicios
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { UsuarioProvider } from '../providers/usuario/usuario';
import { UbicacionProvider } from '../providers/ubicacion/ubicacion';
import { ChatPage } from '../pages/chat/chat';
import { RepartosRealizadosPage } from '../pages/repartos-realizados/repartos-realizados';
import { PedidosPage } from '../pages/pedidos/pedidos';
import { DetallesPedidoPage } from '../pages/detalles-pedido/detalles-pedido';



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
import { ActualizarMenuProvider } from '../providers/actualizar-menu/actualizar-menu';
import { AgmDirectionModule } from 'agm-direction' 

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ChatPage,
    RepartosRealizadosPage,
    PedidosPage,
    DetallesPedidoPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    IonicStorageModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCNrSxTaaXtAZy3Wtucs6voOjCxJGpuujM'
    }),
    AgmDirectionModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ChatPage,
    RepartosRealizadosPage,
    PedidosPage,
    DetallesPedidoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UsuarioProvider,
    UbicacionProvider,
    Geolocation,
    ActualizarMenuProvider,
    FabContainer
  ]
})
export class AppModule {}
