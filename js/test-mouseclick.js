/**
 * @author yanhaijing
 */

(function($, g){
    "use strict";
    var
        Game;
        
    Game = function(){
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.width = 0;
        this.height = 0;
        this.body = null;
        this.direction = 0;//为零不运动
    };
    
    Game.prototype = {
        init:function(container){
            this.initRenderer(container);           
            this.initScene();
            
            this.initCamera();
            this.initLight();
            this.initPlane();
            this.initEvent();
            this.animation();                                
            
        },
        
        animation:function(){
            var self = this;
            function render() {
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


        initCamera:function(){
            var
                camera = new THREE.PerspectiveCamera(
                    35,
                    this.width / this.height,
                    1,
                    100000
                );
            
            camera.position.set(0, 0, 1000);
            camera.lookAt(this.scene.position);
            this.camera = camera;
            this.scene.add(camera);            
        },
        initPlane:function(){
            var
                T = g.THREE,
                planeGeometry = new T.PlaneGeometry(50000,50000),
                planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffb23f } ),
                plane = new T.Mesh(planeGeometry, planeMaterial);
            
            this.scene.add(plane);
            this.planeGeometry = planeGeometry;
            this.plane = plane;
        },
        
        initEvent:function(){
            var
                self = this,
                projector = new THREE.Projector();;
            this.renderer.domElement.addEventListener('click', function(event){
                var
                    x = ( event.clientX / window.innerWidth ) * 2 - 1,
                    y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                    
                var vector = new THREE.Vector3( x, y, 0.5 );
                projector.unprojectVector( vector, self.camera );

                var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

                var intersects = raycaster.intersectObjects( [self.plane] );

                if ( intersects.length > 0 ) {
                    g.console.log("点击了");

                }
            }, false);
        }     
    };
        
    $(function(){
        var
            game = new Game();
            
        game.init($('#view-port').get(0));
    });
}(jQuery, window));
