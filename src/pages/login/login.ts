import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController } from 'ionic-angular';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { HomePage } from '../home/home';
import swal from 'sweetalert';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ActualizarMenuProvider } from '../../providers/actualizar-menu/actualizar-menu';





@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  pedidosSub: Subscription;
    pedidos:any;
   usuario:any = {};
   empresa:string;
   password:string;
  public verificarSub: Subscription;
 /*   conductorSub: Subscription; */

  @ViewChild(Slides) slides: Slides

  constructor(public loadingCrl: LoadingController, private alertCtrl: AlertController,
               public navCtrl: NavController, public navParams: NavParams, public _usuarioProv: UsuarioProvider,
               public _ubicacion: UbicacionProvider, public db:AngularFirestore, public actualizarMenu:ActualizarMenuProvider) {
  }

  ionViewDidLoad() {
    //Cambiamos el tipo de paginacion.
    this.slides.paginationType = 'progress';
    //bloqueamos el swipe para que el usuario no pueda moverse
    this.slides.lockSwipes(true);
    this.slides.freeMode = false;
  }

  ingresar(){
    if(this.empresa && this.password){
        
          this.empresa = this.empresa.toLocaleLowerCase();
          this.password = this.password.toLocaleLowerCase();
          this.verificarUsuario(this.password, this.empresa);
    
    }else{
      this.alertCtrl.create({
        title: 'Ingrese Alguna Contraseña',
        buttons: [
          'Ok'
        ]
      }).present();
    }
  }

/*   async abrirPromp(){

      if(this.empresa){
          
              swal({
                title:'Ingresa tu contraseña',
                content: {
                  element: "input",
                  attributes: {
                    placeholder: "Escribe una Contraseña",
                    type: "password"
                  }
                },
                className: "swal-color",
                timer : 12000
              }).then(password=>{
                if(password){
                    this.verificarUsuario(password, this.empresa);
                }else{
                  swal("Ingrese contraseña", "Intente ingresando una contraseña", "warning", {
                    timer: 2500,
                    className:"swal-color"  
                  });
                }
              });
          
      }else{

        return false;
      }
  } */

  /* METODO DE VERIFICACION DE LOS USUARIOS */
  verificarUsuario(clave:string, empresa:string){
    
    let loading = this.loadingCrl.create({
      content: 'Verificando'
    });
    
    loading.present()

    this._usuarioProv.verificarUsuario(clave, empresa)
                .then(existe =>{
                  if(existe){
                    loading.dismiss();
                    this.slides.lockSwipes(false);
                    this.slides.freeMode = true;
                    this.slides.slideNext();
                    this.slides.lockSwipes(true);
                    this.slides.freeMode = false;
                    this._ubicacion.iniciarTaxista();
                    this.verificarSub = this._ubicacion.taxista.valueChanges().subscribe((data)=>{
                        if(data){
                          this.usuario = data;  
                          console.log(this.usuario);
                          this.pedidosSub = this._ubicacion.taxista.collection('pedidos').valueChanges().subscribe((data:any)=>{
                              if(data){
                                this.actualizarMenu.emitChange(data);
                              }else{
                                console.log("no hay datos de pedidos")
                              }
                          });
                        }else{
                          console.log("no hay datos")
                        }
                    });

                  }else{

                    this.alertCtrl.create({
                      title: 'Contraseña o Empresa Incorrecta',
                      subTitle: 'Reintente o pongase en contacto con la administración',
                      buttons: [
                        'aceptar'
                      ]
                    }).present();
                      
                    loading.dismiss();
                  }
                });

    

  }
  /* FIN METODO */

  irPagina(){
     /* console.log(this.usuario);  */
      this.db.collection(`${this.empresa}`).doc('movil').collection('usuarios').doc(`${this.usuario['clave']}`).update({
      online: true,
      empresa: this.empresa
    }).catch(err =>{
        console.log(err);
    });
    this.navCtrl.setRoot(HomePage);
    if(this.pedidosSub){
      this.pedidosSub.unsubscribe();
    }
  }

}
