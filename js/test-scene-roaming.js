/**
 * @author yanhaijing
 */

(function(g){
    "use strict";
    var
        Game;
        
    Game = function(container){
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.width = 0;
        this.height = 0;
        this.body = null;
        
        this.init(container);
    };
    
    Game.prototype = {
        init:function(container){
            this.initRenderer(container);           
            this.initScene();
            
            this.initCamera();
            this.initLight();
            this.initGround();
            this.initPlane();
            this.initLoad();
            this.initEvent();                                
        },
        
        animation:function(){
            var self = this;
            function render() {
                self.controls.update( self.clock.getDelta() );
                self.renderer.render( self.scene, self.camera );
                requestAnimationFrame( render );
            }
            render();
        },
        /**
         * 初始化渲染器
         * @method initRenderer
         * @param {dom} container 渲染器要添加到的dom元素，若不穿如则默认为body元素
         */
        initRenderer:function(container){
            var
                renderer = new THREE.WebGLRenderer({ antialias: true }),
                container = container || document.getElementsByTagName("body")[0],
                width = container.clientWidth,
                height = container.clientHeight;
                
            renderer.setSize( width, height );
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;
            container.appendChild( renderer.domElement );
            
            this.width = width;
            this.height =height;
            this.renderer = renderer;
        },
        
        initScene:function(){
             var
                scene = new THREE.Scene,
                self = this;
            
            this.scene = scene;
        },
        initLight:function(){
            var ambientLight = new THREE.AmbientLight( 0xffffff );
                this.scene.add( ambientLight );
        },
        initGround:function(){
            var
                ground_material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'img/rocks.jpg' ) }),
                ground;
                
            ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
            ground_material.map.repeat.set( 3, 3 );
            
            ground = new THREE.Mesh(new THREE.CubeGeometry(30000, 1, 30000), ground_material, 0);
            ground.position.y = -2;
            this.scene.add(ground);
        },
        initControls:function(){
            var controls = null,
                clock = new THREE.Clock();
            function getMesh(obj){

                var rets = [];

                if( !(obj instanceof THREE.Mesh) && obj.children ){

                        for(var i=0; i<obj.children.length;i++){

                                var childs = getMesh(obj.children[i]);

                                for(var j=0; j<childs.length; j++) rets.push( childs[j] );                      

                        }                       

                }else{

                        rets.push( obj );                       

                }               

                return rets;

            }
            controls = new THREE.BorderMouseFirstPersonControls({
                camera: this.camera,
                collisionObject: getMesh(this.object),
                movementSpeed: 500,
                lookSpeed: 0.05,
                lookVertical: true,
                collision:false
            });
            
            this.controls = controls;
            this.clock = clock;
        },
        initCamera:function(){
            var
                camera = new THREE.PerspectiveCamera(
                    35,
                    this.width / this.height,
                    1,
                    100000
                );
            
            camera.position.set(-3500, 1000, 5000);
            camera.lookAt(this.scene.position);
            this.camera = camera;
            this.scene.add(camera);            
        },
        
        initLoad:function(){
            var loader = new THREE.OBJMTLLoader(),
            self = this;
            
            loader.addEventListener( 'load', function ( event ) {

                var object = event.content;
                console.log(object);
                self.object = object;
                self.scene.add( object );
                self.initControls.call(self);
                self.animation.call(self);
                //self.camera.lookAt(new THREE.Vector3(0,-100,0));
    
            });
            
            loader.load( 'obj/room/room.obj', 'obj/room/room.mtl' );
        },

        initPlane:function(){
            var
                T = g.THREE,
                planeGeometry = new T.PlaneGeometry(800,1000),
                planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffb23f } ),
                plane = new T.Mesh(planeGeometry, planeMaterial);
            
            plane.position.set(-3800, 1000, 1600);
            this.scene.add(plane);
            this.planeGeometry = planeGeometry;
            this.plane = plane;
        },
        
        initEvent:function(){
            var
                self = this,
                projector = new THREE.Projector();
            this.renderer.domElement.addEventListener('click', function(event){
                var
                    x = ( event.clientX / window.innerWidth ) * 2 - 1,
                    y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                    
                var vector = new THREE.Vector3( x, y, 1 );
                projector.unprojectVector( vector, self.camera );

                var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

                var intersects = raycaster.intersectObjects( [self.plane] );

                if ( intersects.length > 0 ) {
                    self.camera.position.z = 1000;
                }
            }, false);
            
            this.initKeyEvent();
        },
        
        initKeyEvent:function(){
            var
                self = this;
            
            function toggleCollision(){
                var
                    control = self.controls;
                
                control.setCollision(!control.isCollision());
            }
            document.addEventListener('keypress', function(e){
                //按键为c
                if(e.keyCode === 99){
                    toggleCollision();
                }
            }, false)
        }     
    };
        
    document.addEventListener('DOMContentLoaded', function(){
        var
            game = new Game(document.getElementById('view-port'));           
    }, false);
}(window));
