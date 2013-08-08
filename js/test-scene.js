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
            this.initPhysijs();
            this.initRenderer(container);           
            this.initScene();
            
            this.initCamera();
            this.initLight();
            this.initGround();
            this.initControls();
            this.initLoad();
            this.initShapes();
            
            var self = this;
            
            function render() {
                self.controls.update( self.clock.getDelta() );
                self.renderer.render( self.scene, self.camera );
                requestAnimationFrame( render );
            }
            self.scene.simulate();
            render();
        },
        initPhysijs:function(){
            g.Physijs.scripts.worker = 'plugin/physijs/physijs_worker.js';
            g.Physijs.scripts.ammo = 'ammo.js';
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
                scene = new Physijs.Scene,
                self = this;
            scene.setGravity(new THREE.Vector3( 0, -1000, 0 ));
            scene.addEventListener(
                'update',
                function() {
                    scene.simulate( undefined, 2 );
                }
            );
            
            this.scene = scene;
        },
        initLight:function(){
            var ambientLight = new THREE.AmbientLight( 0xffffff );
                this.scene.add( ambientLight );
        },
        initGround:function(){
            var
                ground_material = Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'img/rocks.jpg' ) }),
                    .8, // high friction
                    .4 // low restitution
                ),
                ground;
            ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
            ground_material.map.repeat.set( 3, 3 );
            
            ground = new Physijs.BoxMesh(new THREE.CubeGeometry(30000, 1, 30000), ground_material, 0);
            ground.position.y = -2;
            this.scene.add(ground);
        },
        initControls:function(){
            var controls = new THREE.FirstPersonControls( this.camera ),
                clock = new THREE.Clock();

            controls.movementSpeed = 1000;
            controls.lookSpeed = 0.125;
            controls.lookVertical = true;
            
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
            
            camera.position.set(0, 0, 10000);
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
    
                self.scene.add( object );
                //self.camera.lookAt(new THREE.Vector3(0,-100,0));
    
            });
            
            loader.load( 'obj/room/room.obj', 'obj/room/room.mtl' );
        },
        
        initShapes:function(){
            var
                box = null,
                box_material = new Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('img/plywood.jpg')}),
                    1.0, // low friction
                    0.9 // high restitution
                ),
                box_geometry = new THREE.CubeGeometry( 5000, 5000, 5000 ),
                i = 0,
                j = 0,
                len = 10;                   
            box_material.map.wrapS = THREE.RepeatWrapping;
            box_material.map.repeat.set( .25, .25 );
            for(i = 0; i < len; i = i + 1){
                for(j = 0; j < len; j = j + 1){
                    box = new Physijs.BoxMesh(
                        box_geometry,
                        box_material
                    );
                    
                    box.position.set(-50000 + 2.5 + i * 10000, 30000, -50000 + 2.5 + j * 10000);
                    this.scene.add(box);
                }
            }                       
        },        
    };
    
    
    $(function(){
        var
            game = new Game();
            
        game.init($('#view-port').get(0));
    });
}(jQuery, window));
