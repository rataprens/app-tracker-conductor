import { Component } from '@angular/core';
import { NavController, Platform, AlertController, FabContainer } from 'ionic-angular';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { LoginPage } from '../login/login';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ToastController } from 'ionic-angular';
import { ActualizarMenuProvider } from '../../providers/actualizar-menu/actualizar-menu';

interface InfoEmpresa{
    direccion: string,
    lat:number ,
    lng:number ,
    nombre: string,
    numeroTelefono:number ,
    password: string,
    tipo: string,
    tipoPlan:string 
    }

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  
  public origin: any;
  public destination: any;
  lat: number = -36.7819765;
  lng: number = -73.0818353;
  user: any = "Hola";
  user2: any;
  clave:string;
  empresa:string;
  init:boolean = false;
  pedidosUbicacion :any[];
  public estadoSub: Subscription;
  pedidosSub: Subscription;
  map: any;
  geolocalizacionIniciada:boolean;
  iconoTema: string = 'sunny';
  estadoMapa: boolean = false;
  pedidos:any[];
  styles: any = require('../../jsonfiles/theme-dia.json');
  waypoints:any[] = [
   
  ];
  empresaLng:any;
  empresaLat:any;
  pedidosActivos:any[];
  iconoComenzarGeo:string = "navigate-outline";
  public renderOptions = {
    suppressMarkers: true,
  };
  public markerOptions = {
    origin: {
        draggable: false,
        opacity: 0
    },
    destination: {
        opacity: 1,
        draggable: true
    },
    waypoints: {
      draggable:false,
      icon: ""
    }
  };
  crearRuta:boolean = false;
  iconoRuta:string = "map-outline";
  empresaDoc: AngularFirestoreDocument;

  infoEmpresa:InfoEmpresa;

  constructor(public navCtrl: NavController, 
              public _ubicacionProv: UbicacionProvider, 
              public platform: Platform,
              public _usuarioProv: UsuarioProvider,
              public db:AngularFirestore,
              public storage:Storage,
              private toast:ToastController,
              public alertCtrl: AlertController,
              public actualizarService:ActualizarMenuProvider) {

          /* OBTENEMOS LA CLAVE DEL USUARIO ALMACENADA EN EL LOCAL STORAGE */
          if(this.platform.is('cordova')){
            /* movil */
            this.storage.get('clave').then( clave =>{
                if(clave){
                    this.clave = clave;
                }
            });

            this.storage.get('empresa').then(nombre =>{
                if(nombre){
                  this.empresa = nombre;
              }else{
                let toast = this.toast.create({
                  message: `no hay clave`,
                  duration: 3000,
                  position: 'top'
                });
                toast.present();
                }
            });

            this.storage.get('geolocalizacionIniciada').then(geolocalizacionIniciada =>{
               if(geolocalizacionIniciada){
                 if(geolocalizacionIniciada == 'true'){
                   this.geolocalizacionIniciada = true;
                   this._ubicacionProv.iniciarGeolocalizacion();
                   this.iconoComenzarGeo = 'navigate';
                 }else{
                  this.geolocalizacionIniciada = false;
                  this._ubicacionProv.detenerGeolocalizacion();
                  this.iconoComenzarGeo = 'navigate-outline';
                 }
               }else{
                  return false;
               }
            });

            this.storage.get('estadoMapa').then(estadoMapaStorage=>{
                if(estadoMapaStorage){
                  if(estadoMapaStorage  == 'true'){
                      this.estadoMapa = true;
                      this.styles = require('../../jsonfiles/theme-noche.json');
                      this.iconoTema = 'moon';
                  }else{
                    this.estadoMapa = false;
                    this.styles = require('../../jsonfiles/theme-dia.json');
                    this.iconoTema = 'sunny';
                  }
                }else{
                    return false;
                }
            });

          }else{
              /* Escritorio */
              this.clave = localStorage.getItem('clave');
              this.empresa = localStorage.getItem('empresa')
              if(localStorage.getItem('geolocalizacionIniciada') == 'true'){
                this.geolocalizacionIniciada = true;
              }else{
                this.geolocalizacionIniciada = false;
              }
              if(localStorage.getItem('estadoMapa') == 'true'){
                this.estadoMapa = true;
                this.styles = require('../../jsonfiles/theme-noche.json');
                this.iconoTema = 'moon';
              }else{
                this.estadoMapa = false;
                this.styles = require('../../jsonfiles/theme-dia.json');
                this.iconoTema = 'sunny';
              }
              /* console.log(this.clave, this.empresa); */
          }
            /* FIN */
            
/*       if(this.geolocalizacionIniciada == false){
        this._ubicacionProv.iniciarGeolocalizacion();
      }else{
        
      } */

      this._usuarioProv.getDatosEmpresa(this.empresa).subscribe((data:InfoEmpresa)=>{
        console.log(data);
        this.infoEmpresa = data;
      });    

      this._ubicacionProv.iniciarConductor();
      /* this._ubicacionProv.iniciarGeolocalizacion(); */
      this.estadoSub = this._ubicacionProv.conductor.valueChanges()
            .subscribe((data:any) =>{
              if(data){
                this.user = data;
                this.origin = { lat: this.user.lat, lng: this.user.lng };
                console.log(this.user);
                this.pedidosSub = this._ubicacionProv.conductor.collection('pedidos').valueChanges().subscribe((data:Array<any>)=>{
                  if(data){
                    console.log(data);
                    this.pedidos = data;
/*                     this.pedidosActivos = this.pedidos.filter(pedido=> pedido.entregado == false);
                    for(var pedido of this.pedidosActivos){
                      this.waypoints.push({
                        location: {lat: pedido.pedidoLat, lng:pedido.pedidoLng},
                        stopover:false
                      })
                    } */
                    this.actualizarService.emitChange(data);
                  }else{
                    console.log("no hay datos de pedidos")
                  }
                });

              }else{
                console.log("No hay datos")
              }
          });  

        console.log(this.user);
        console.log(this.empresa, this.clave);
    }

  ionViewDidLoad(){
  }

  salir(){ 

    let alert = this.alertCtrl.create({
      title: 'Confirmar Desconexión',
      message: '¿Está seguro que desea salir ?',
      buttons: [
        {
          text: 'No, cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelar clickeado');
          }
        },
        {
          text: 'Sí, estoy seguro',
          handler: () => {
            this.db.collection('locales').doc(`${this.empresa}`).collection('movil').doc(`${this.clave}`).update({
              online: false,
              empresa: this.empresa
            });
            this._usuarioProv.borrarStorage();
            if(this._usuarioProv.doc){
              this._usuarioProv.detenerSub();
            }else if(this.user === {}){
              return
            }
            if(this.pedidosSub){
              this.pedidosSub.unsubscribe();
            }
            //storage borrado
            console.log("el storage a sido borrado");
            this._ubicacionProv.detenerGeolocalizacion();
            this.estadoSub.unsubscribe();
            this.navCtrl.setRoot(LoginPage);
          }
        }
      ]
    });
    alert.present();
  }

  comenzarGeo(nombre:string, fab:FabContainer){
    if(!this.geolocalizacionIniciada){

      this.alertCtrl.create({
        title: `¿${nombre} desea comenzar la navegación?`,
        message: 'se comenzará con el rastreo de su ruta',
        buttons: [
          {
            text: 'Ok, comenzar',
            role: 'confirm',
            handler: ()=>{
              this._ubicacionProv.iniciarGeolocalizacion();
              this.storage.set('geolocalizacionIniciada', 'true');
              this.geolocalizacionIniciada = true;
              this.iconoComenzarGeo = 'navigate'
              
            }
          },
          {
            text: 'No, cancelar',
            role: 'cancel',
            handler: ()=>{
              fab.close();
            }
          }
        ]
      }).present();
    }else{
      this.alertCtrl.create({
        title: `¿${nombre} desea terminar la navegación?`,
        message: 'se terminará con el rastreo de su ruta',
        buttons: [
          {
            text: 'Ok, terminar',
            role: 'confirm',
            handler: ()=>{
              this._ubicacionProv.detenerGeolocalizacion();
              this.storage.set('geolocalizacionIniciada', 'false');
              this.geolocalizacionIniciada = false;
              this.iconoComenzarGeo = 'navigate-outline'
              
            }
          },
          {
            text: 'No, cancelar',
            role: 'cancel',
            handler: ()=>{
              fab.close();
            }
          }
        ]
      }).present();
    }
  }

  mapReady(map){
    this.map = map;
  }

  localizar(user: any){
      if(this.map){
        this.map.setCenter({lat: user.lat, lng: user.lng});
        console.log("mapa seteado");
      }else{
        console.log("mapa no seteado");
      }
  }

  cambiarTema(nombre:string, fab: any){
    if(!this.estadoMapa){

      this.alertCtrl.create({
        title: '¿Cambiar Tema?',
        message: `${nombre} se cambiará al tema de noche`,
        buttons: [
          {
          text: 'Ok',
          role: 'confirm',
          handler: ()=>{
              let tema_dia = require('../../jsonfiles/theme-noche.json');
              this.styles = tema_dia;
              this.iconoTema = 'moon';
              this.estadoMapa = true;
              this.storage.set('estadoMapa', 'true');
              localStorage.setItem('estadoMapa', 'true');
            }
          }
        ]
      }).present();
    }else{
      this.alertCtrl.create({
        title: '¿Cambiar Tema?',
        message: `${nombre} se cambiará al tema de día`,
        buttons: [
          {
          text: 'Ok',
          role: 'confirm',
          handler: ()=>{
              let tema_dia = require('../../jsonfiles/theme-dia.json');
              this.styles = tema_dia;
              this.iconoTema = 'sunny';
              this.estadoMapa = false;
              this.storage.set('estadoMapa', 'false');
              localStorage.setItem('estadoMapa', 'false');
            }
          }
        ]
      }).present();
    }
  }

  generarRuta(user:any, fab:any){

    if(!this.crearRuta){

      this.alertCtrl.create({
        title: '¿Desea generar una ruta óptima?',
        message: `${user.nombre} se creará una ruta óptima a partir de los pedidos asignados`,
        buttons: [
          {
          text: 'Ok',
          role: 'confirm',
          handler: ()=>{  

          this.origin = { lat: user.lat, lng: user.lng };
          this.pedidosActivos = this.pedidos.filter(pedido=> pedido.entregado == false);
          
            for(var pedido of this.pedidosActivos){
              this.waypoints.push({
                location: {lat: pedido.pedidoLat, lng: pedido.pedidoLng},
                stopover:false
              }); 
              console.log(pedido.pedidoLng); 
            }
           /*  this.destination = { lat: -36.787426, lng: -73.086887 }; */
           this.destination = { lat: this.infoEmpresa.lat, lng: this.infoEmpresa.lng };
            this.crearRuta = true;
            this.iconoRuta = 'map';
            }
          }
        ]
      }).present();
      fab.close();
    }else{
      this.alertCtrl.create({
        title: '¿Desea quitar la ruta óptima?',
        message: `${user.nombre} se quitará la ruta óptima del mapa`,
        buttons: [
          {
          text: 'Ok',
          role: 'confirm',
          handler: ()=>{
            this.origin = null;
            this.waypoints = [];
            this.destination = null;
            this.crearRuta = false;
            this.iconoRuta = 'map-outline';
            this.map.setCenter({lat: this.user.lat , lng: this.user.lng});
            this.map.setZoom(16);
            }
          }
        ]
      }).present();

    }
    
  }

  public change(event: any) {
    this.waypoints = event.request.waypoints;
  }

}
