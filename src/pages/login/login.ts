import { Component, ViewChild, HostListener } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController } from 'ionic-angular';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { HomePage } from '../home/home';
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

  //VARIABLES
  pedidosSub: Subscription;
  pedidos:any;
  usuario:any = {};
  empresa:string;
  password:string;
  public verificarSub: Subscription;
  @ViewChild(Slides) slides: Slides
  key:any;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    this.key = event.key;
    console.log(this.key);
    if(this.key === 'Enter'){
      this.ingresar();
    }
  }
  //FIN VARIABLES
  
  //CONSTRUCTOR
  constructor(public loadingCrl: LoadingController, private alertCtrl: AlertController,
               public navCtrl: NavController, public navParams: NavParams, public _usuarioProv: UsuarioProvider,
               public _ubicacion: UbicacionProvider, public db:AngularFirestore, public actualizarMenu:ActualizarMenuProvider) {
  }

  //FIN CONSTRUCTOR

  //METODOS
  //Cuando la vista esté cargada =>
  ionViewDidLoad() {
    //Cambiamos el tipo de paginacion.
    this.slides.paginationType = 'progress';
    //bloqueamos el swipe para que el usuario no pueda moverse
    this.slides.lockSwipes(true);
    this.slides.freeMode = false;
  }
  //Metodo para ingresar
  ingresar(){
    //Si las variables empresa y password existen
    if(this.empresa && this.password){
        //Transforma las variables a minusculas
          this.empresa = this.empresa.toLocaleLowerCase();
          this.password = this.password.toLocaleLowerCase();
        //Llamamos al metodo verificarUsuario
          this.verificarUsuario(this.password, this.empresa);
    
    }else{
      //Si no lanza un Alert Controller pidiendo que se vuelva
      //a ingresar alguna de las dos variables
      this.alertCtrl.create({
        title: 'Ingrese Alguna Contraseña',
        buttons: [
          'Ok'
        ]//Por ultimo presentamos el Alert Controller
      }).present();
    }
  }
  //Metodo para verificar el usuario en la bd
  verificarUsuario(clave:string, empresa:string){
    //Creamos un Loading Controller con un contenido que diga "Verificando"
    let loading = this.loadingCrl.create({
      content: 'Verificando'
    });
    //Presentamos el Loading Controller
    loading.present()
    //LLamamos al Usuario Provider y accedemos a su metodo llamado verificarUsuario 
    //que recibe dos valores, clave y empresa
    this._usuarioProv.verificarUsuario(clave, empresa)
                  //Devuelve un valor boolean, true o false
                .then(existe =>{
                  //Si el valor es verdadero significa que existe
                  if(existe){
                    //Dejamos de presentar el Loading Controller cargado con anterioridad
                    loading.dismiss();
                    //CONFIGURACIONES DEL OBJETO SLIDE
                    this.slides.lockSwipes(false);
                    this.slides.freeMode = true;
                    this.slides.slideNext();
                    this.slides.lockSwipes(true);
                    this.slides.freeMode = false;
                    //Llamamos a Ubicacion Provider y accedemos a su metodo iniciar taxista
                    this._ubicacion.iniciarConductor();
                    this.verificarSub = this._ubicacion.conductor.valueChanges().subscribe((data)=>{
                        if(data){
                          this.usuario = data;  
                          console.log(this.usuario);
                          this.pedidosSub = this._ubicacion.conductor.collection('pedidos').valueChanges().subscribe((data:any)=>{
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
       this.db.collection('locales').doc(`${this.empresa}`).collection('movil').doc(`${this.usuario['clave']}`).update({
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
