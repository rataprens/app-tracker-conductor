import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform, AlertController, ModalController } from 'ionic-angular';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { LoginPage } from '../login/login';
import { DetallesPedidoPage } from '../detalles-pedido/detalles-pedido';


@IonicPage()
@Component({
  selector: 'page-pedidos',
  templateUrl: 'pedidos.html',
})
export class PedidosPage {
  user: any = {}
  public userSub: Subscription;
  public pedidoSub: Subscription;
  clave:string;
  empresa:string;
  pedidos: any;
  constructor(public modalCtrl:ModalController,public alertCtrl:AlertController,public db:AngularFirestore,public _usuarioProv:UsuarioProvider,public toast:ToastController,public storage:Storage,public platform: Platform,public navCtrl: NavController, public navParams: NavParams, public _ubicacionProv:UbicacionProvider) {
        
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
    
    this.userSub = this._ubicacionProv.taxista.valueChanges().subscribe((data:any) =>{
        if(data){
          this.user = data;
          console.log('Datos Correctos');
          console.log(this.user[0]);
        }else{
          console.log('Datos Incorrectos');
        }
    });

    this.pedidoSub = this._ubicacionProv.taxista.collection('pedidos').valueChanges().subscribe((data:any)=>{
      if(data){
        this.pedidos = data;
        console.log(this.pedidos);
        console.log("datos correctos");
      }else{
        console.log("datos incorrectos");
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PedidosPage');
  }

  abrirDetalles(pedido:any){
    console.log(pedido);
    const modal = this.modalCtrl.create(DetallesPedidoPage, {pedido});
    modal.present();
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
            //storage borrado
            console.log("el storage a sido borrado");
            this._ubicacionProv.detenerGeolocalizacion();
            this.userSub.unsubscribe();
            this.navCtrl.setRoot(LoginPage);
          }
        }
      ]
    });
    alert.present();
  }

}


