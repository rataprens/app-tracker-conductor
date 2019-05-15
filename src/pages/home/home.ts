import { Component } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { LoginPage } from '../login/login';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ToastController } from 'ionic-angular';
import swal from 'sweetalert';
import { ActualizarMenuProvider } from '../../providers/actualizar-menu/actualizar-menu';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
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
          }else{
              /* Escritorio */
              this.clave = localStorage.getItem('clave');
              this.empresa = localStorage.getItem('empresa')
              /* console.log(this.clave, this.empresa); */
          }
            /* FIN */


      this._ubicacionProv.iniciarTaxista();
      this._ubicacionProv.iniciarGeolocalizacion();
      this.estadoSub = this._ubicacionProv.taxista.valueChanges()
            .subscribe((data:any) =>{
              if(data){
                this.user = data;
                console.log(this.user);

                ///TOAST COMPARTIENDO

/*                 if(this.user.compartir === true){
                  let toast = this.toast.create({
                    message: `Su estado es: ${this.user.compartir}`,
                    duration: 3000,
                    position: 'top'
                  });
                  toast.present();
                }else{
                  let toast = this.toast.create({
                    message: `Su estado es: ${this.user.compartir}`,
                    duration: 3000,
                    position: 'top'
                  });
                  toast.present();
                } */
                
              this.pedidosSub = this._ubicacionProv.taxista.collection('pedidos').valueChanges().subscribe((data:Array<any>)=>{
                if(data){
                  this.pedidosUbicacion = data.filter(pedido => pedido.direccion );
                  console.log(this.pedidosUbicacion);
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
      message: '¿Esta seguro que desea salir ?',
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
            this.db.collection(`${this.empresa}`).doc('movil').collection('usuarios').doc(`${this.clave}`).update({
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

  cargarConductor(){
    return new Promise((resolve, reject)=>{

    });
  }

}
