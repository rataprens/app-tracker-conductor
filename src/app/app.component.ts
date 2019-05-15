import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, App, MenuController, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { UsuarioProvider } from '../providers/usuario/usuario';
import { AngularFirestore } from '@angular/fire/firestore';
import { ChatPage } from '../pages/chat/chat';
import { RepartosRealizadosPage } from '../pages/repartos-realizados/repartos-realizados';
import { PedidosPage } from '../pages/pedidos/pedidos';
import { UbicacionProvider } from '../providers/ubicacion/ubicacion';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { ActualizarMenuProvider } from '../providers/actualizar-menu/actualizar-menu';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  conectado:boolean = false;
  compartiendo:boolean;
  @ViewChild(Nav) nav: Nav;
  rootPage:any;
  user:any;
  usuarioSub: Subscription;
  pages: Array<{title: string, component: any, icon: string}>;
  pedidoSub: Subscription;
  pedidos:any;
  clave: any;
  empresa: any;
  pedidosNoEntregados: any[];
  pedidosEntregados: any[];
  cantidadPedidosEntregados : number;
  cantidadPedidosNoEntregados: number;


  constructor(public storage:Storage,platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
     public _usuarioProv: UsuarioProvider, public db: AngularFirestore,
     public app:App, public menuCtrl: MenuController, public toast:ToastController,
     public _ubicacionProv: UbicacionProvider, public actualizarMenu: ActualizarMenuProvider) {
    //Cuando la plataforma esta cargada
    this.pages = [
      {title:'Pedidos', component: PedidosPage, icon: 'paper-outline'},
      {title:'Chat', component: ChatPage, icon: 'chatbubbles-outline'},
      {title:'Repartos Entregados', component: RepartosRealizadosPage, icon: 'checkmark-circle-outline'}
    ]
    platform.ready().then(() => {

      if(this.conectado == false){
        this.menuCtrl.swipeEnable(false);
      }else{
        this.menuCtrl.swipeEnable(true);
      }
        //llamamos al servicio del usuario para cargar el storage
      _usuarioProv.cargarStorage().then(existe=>{
          
        statusBar.styleDefault();
        splashScreen.hide();

        if(existe){
          //Correcto, el root de la pag es HomePage
          this.rootPage = HomePage;
          this.conectado = true;
        }else{
            //Incorrecto, el root de la pag es LoginPage
          this.rootPage = LoginPage;
          this.conectado = false;
      }
       
      });
        
      this.actualizarMenu.changeEmitted$.subscribe((data)=>{
        this.pedidos = data;
        console.log(this.pedidos);
        this.pedidosEntregados = this.pedidos.filter( pedido => pedido.entregado === true);
        this.cantidadPedidosEntregados = this.pedidosEntregados.length;
        console.log(this.cantidadPedidosEntregados);
        this.pedidosNoEntregados = this.pedidos.filter( pedido => pedido.entregado === false);
        this.cantidadPedidosNoEntregados = this.pedidosNoEntregados.length;
        console.log(this.cantidadPedidosNoEntregados);
      });


    });

  }

  abrirMapa(){
    this.nav.setRoot(HomePage);
  }
  abrirChat(){
    this.nav.setRoot(ChatPage);
  }
  abrirPedidos(){
    this.nav.setRoot(PedidosPage);
  }
  abrirRepartos(){
    this.nav.setRoot(RepartosRealizadosPage);
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

