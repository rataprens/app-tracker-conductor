import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { LoginPage } from '../login/login';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ToastController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  lat: number = -36.7819765;
  lng: number = -73.0818353;
  user: any = {};
  clave:string;
  empresa:string;
  conductorSub: Subscription;
  init:boolean = false;

  constructor(public navCtrl: NavController, 
              public _ubicacionProv: UbicacionProvider, 
              public platform: Platform,
              public _usuarioProv: UsuarioProvider,
              public db:AngularFirestore,
              public storage:Storage,
              private toast:ToastController) {
                
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
                      }
                  });
                }else{
                    /* Escritorio */
                    this.clave = localStorage.getItem('clave');
                    this.empresa = localStorage.getItem('empresa')
                    /* console.log(this.clave, this.empresa); */
                }
                  /* FIN */

                       //CUANDO LA PLATAFORMA ESTE LISTA CARGADA       
                  this.platform.ready().then(()=>{
                    //LLamamos al servicio de ubicacion e iniciamos el metodo iniciarTaxista()
                    this._ubicacionProv.iniciarTaxista();
                    this._ubicacionProv.iniciarGeolocalizacion();
                    this._ubicacionProv.taxista.valueChanges()
                                              .subscribe((data) =>{
                                                this.user = data;
                                              });   
                                              
                                              /* EVALUACION SI EXISTE CLAVE  */
                                              /*                     this.db.collection(`${this.empresa}`).doc('movil').collection('usuarios').doc(`${this.clave}`).valueChanges().subscribe(data =>{
                                                this.user = data;
                                              });
                                              
                                              
                                              console.log(this.user); */                     
                                            });

                  this.conductorSub = this.db.collection(`${this._ubicacionProv.empresa}`).doc(`movil`).collection(`usuarios`).doc(`${this._ubicacionProv.clave}`).valueChanges().subscribe((data:any)=>{
                      console.log(data);
                      if(data.compartir === true){
                        console.log("COMPARTIENDO");
                        if(!this.init){
                          let toast = this.toast.create({
                            message: "Su Ruta está siendo compartida",
                            duration: 3000,
                            position: 'top'
                          });
                          toast.present();
                          this.init = true;
                        }else{
                          return false;
                        }
                      }else{
                        console.log("YA NO COMPARTIENDO");
                          if(this.init){

                            let toast = this.toast.create({
                              message: "Su Ruta ya no está siendo compartida",
                              duration: 3000,
                              position: 'top'
                            });
                            toast.present();
                            this.init = false;
                          }else{
                            return false;
                          }
                      }
                  });
              }

    ionViewDidLoad(){
    }

  salir(){
    this.db.collection(`${this.empresa}`).doc('movil').collection('usuarios').doc(`${this.clave}`).update({
      online: false,
      empresa: this.empresa
    });
    this.conductorSub.unsubscribe(); /* Ultimo CAMBIO */
    this._ubicacionProv.detenerGeolocalizacion();
    this._usuarioProv.borrarStorage();
    this.navCtrl.setRoot( LoginPage);

  }

}
