// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.sims.engine2D.CartPendulum2App');

goog.require('myphysicslab.lab.controls.NumericControl');
goog.require('myphysicslab.lab.engine2D.ContactSim');
goog.require('myphysicslab.lab.model.DampingLaw');
goog.require('myphysicslab.lab.model.GravityLaw');
goog.require('myphysicslab.lab.engine2D.Joint');
goog.require('myphysicslab.lab.engine2D.Scrim');
goog.require('myphysicslab.lab.engine2D.Shapes');
goog.require('myphysicslab.lab.engine2D.Walls');
goog.require('myphysicslab.lab.model.CollisionAdvance');
goog.require('myphysicslab.lab.model.CoordType');
goog.require('myphysicslab.lab.model.Spring');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.sims.engine2D.Engine2DApp');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.TabLayout');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var NumericControl = lab.controls.NumericControl;
var CollisionAdvance = lab.model.CollisionAdvance;
var CommonControls = sims.layout.CommonControls;
var ContactSim = lab.engine2D.ContactSim;
var CoordType = lab.model.CoordType;
var DampingLaw = lab.model.DampingLaw;
var DoubleRect = lab.util.DoubleRect;
var Engine2DApp = sims.engine2D.Engine2DApp;
var GravityLaw = lab.model.GravityLaw;
var Joint = lab.engine2D.Joint;
var ParameterNumber = lab.util.ParameterNumber;
var Scrim = lab.engine2D.Scrim;
var Shapes = lab.engine2D.Shapes;
var Spring = lab.model.Spring;
var UtilityCore = lab.util.UtilityCore;
var Vector = lab.util.Vector;
var Walls = lab.engine2D.Walls;

/** Simulation of a cart moving on a horizontal track with a pendulum suspended from the
cart.  Intended to be similar to {@link myphysicslab.sims.pendulum.CartPendulumSim}.

This sim has a `configure` function which looks at a set of options
and rebuilds the simulation accordingly. UI controls are created to change the options.

* @param {!sims.layout.TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @struct
* @extends {Engine2DApp}
* @export
*/
myphysicslab.sims.engine2D.CartPendulum2App = function(elem_ids) {
  var simRect = new DoubleRect(-3, -2, 3, 2);
  this.mySim = new ContactSim();
  var advance = new CollisionAdvance(this.mySim);
  Engine2DApp.call(this, elem_ids, simRect, this.mySim, advance);
  this.mySim.setShowForces(false);
  /** @type {!lab.model.DampingLaw} */
  this.dampingLaw = new DampingLaw(/*damping=*/0, /*rotateRatio=*/0.15, this.simList);
  /** @type {!lab.model.GravityLaw} */
  this.gravityLaw = new GravityLaw(9.8, this.simList);
  this.elasticity.setElasticity(0.8);
  /** @type {number} */
  this.stiffness = 6;
  /** @type {number} */
  this.springDamping = 0;
  /** @type {?Spring} */
  this.spring = null;

  this.addPlaybackControls();
  /** @type {!lab.util.ParameterNumber} */
  var pn;
  pn = this.gravityLaw.getParameterNumber(GravityLaw.en.GRAVITY);
  this.addControl(new NumericControl(pn));
  this.watchEnergyChange(pn);

  pn = this.dampingLaw.getParameterNumber(DampingLaw.en.DAMPING);
  this.addControl(new NumericControl(pn));

  this.addParameter(pn = new ParameterNumber(this, CartPendulum2App.en.SPRING_DAMPING,
      CartPendulum2App.i18n.SPRING_DAMPING,
     this.getSpringDamping, this.setSpringDamping));
  this.addControl(new NumericControl(pn));

  this.addParameter(pn = new ParameterNumber(this, CartPendulum2App.en.STIFFNESS,
      CartPendulum2App.i18n.STIFFNESS,
     this.getStiffness, this.setStiffness));
  this.addControl(new NumericControl(pn));

  this.addStandardControls();

  this.makeEasyScript();
  this.addURLScriptButton();
  this.configure();
  this.graphSetup();
};
var CartPendulum2App = myphysicslab.sims.engine2D.CartPendulum2App;
goog.inherits(CartPendulum2App, Engine2DApp);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  CartPendulum2App.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', dampingLaw: '+this.dampingLaw.toStringShort()
        +', gravityLaw: '+this.gravityLaw.toStringShort()
        + CartPendulum2App.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
CartPendulum2App.prototype.getClassName = function() {
  return 'CartPendulum2App';
};

/** @inheritDoc */
CartPendulum2App.prototype.defineNames = function(myName) {
  CartPendulum2App.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('gravityLaw|dampingLaw',
       myName);
  this.terminal.addRegex('CartPendulum2App|Engine2DApp',
       'myphysicslab.sims.engine2D', /*addToVars=*/false);
};

/** @inheritDoc */
CartPendulum2App.prototype.getSubjects = function() {
  var subjects = CartPendulum2App.superClass_.getSubjects.call(this);
  return goog.array.concat(this.dampingLaw, this.gravityLaw, subjects);
};

/**
* @return {undefined}
* @private
*/
CartPendulum2App.prototype.configure = function() {
  var elasticity = this.elasticity.getElasticity();
  this.mySim.cleanSlate();
  this.advance.reset();
  // wall pivot point is where in world space the pivot is
  var wallPivotX = -0.85;
  var wallPivotY = 0;
  var displacement = 0.13; //=(6.0/5.83)*0.13; initial displacement; to match other sim.

  // the cart (on track)
  var cart = Shapes.makeBlock2(0.3, 1.0, CartPendulum2App.en.CART,
      CartPendulum2App.i18n.CART);
  var pivotX = 0.5*cart.getWidth();
  var pivot1Y = 0.85*cart.getHeight();
  var pivot2Y = 0.15*cart.getHeight();
  var bodyX = 0.3*cart.getWidth(); // was 0.5
  var bodyY = 0.5*cart.getHeight();
  //cart.setDragPoints([Vector.ORIGIN]);
  this.mySim.addBody(cart);
  this.displayList.findShape(cart).setFillStyle('rgb(200,200,200)');

  // the pendulum
  var pendulum = Shapes.makePendulum(/*stickwidth=*/0.03,
      /*sticklength=*/1.0, /*radius=*/0.15, CartPendulum2App.en.PENDULUM,
      CartPendulum2App.i18n.PENDULUM);
  //pendulum.setDragPoints(
  //    [new Vector(0.5*pendulum.getWidth(), 0.15*pendulum.getHeight())]);
  //var otherBodyX = .5* pendulum.getWidth();
  //var otherBodyY = .85* pendulum.getHeight();
  this.mySim.addBody(pendulum);
  this.displayList.findShape(pendulum).setFillStyle('#B0C4DE').setDrawCenterOfMass(true);
  //this.mySim.addBody(this.mySim.getScrim());

  this.spring = new Spring('spring1',
      cart, new Vector(0.5*cart.getWidth(), 0.5*cart.getHeight()),
      Scrim.getScrim(), new Vector(3, 0),
      /*restLength=*/3.0, /*stiffness=*/this.stiffness);
  this.spring.setDamping(this.springDamping);
  this.mySim.addForceLaw(this.spring);
  this.mySim.getSimList().add(this.spring);
  this.displayList.findSpring(this.spring).setWidth(0.3);

  cart.setPosition(new Vector(1,  0),  Math.PI/2);

  // Make joints to keep the cart on the track.
  // These joints are only pushing vertically, one joint is forward,
  // the other aft on the body.
  var pivot1_body = new Vector(pivotX, pivot1Y);
  var fixed1_world = cart.bodyToWorld(pivot1_body);
  var j1 = new Joint(
    cart, pivot1_body,
    Scrim.getScrim(), fixed1_world,
    CoordType.WORLD, Vector.SOUTH
    );
  this.mySim.addConnector(j1);
  var pivot2_body = new Vector(pivotX, pivot2Y);
  var fixed2_world = cart.bodyToWorld(pivot2_body);
  var j2 = new Joint(
    cart, pivot2_body,
    Scrim.getScrim(), fixed2_world,
    CoordType.WORLD, Vector.SOUTH
    );
  this.mySim.addConnector(j2);

  // make a double joint to attach the pendulum to the cart
  Joint.attachRigidBody(this.mySim,
    cart,  /*attach1_body=*/new Vector(cart.getWidth()/2, cart.getHeight()/2),
    pendulum, /*attach2_body=*/new Vector(0, 1),
    /*normalType=*/CoordType.BODY
    );
  this.mySim.alignConnectors();
  // set zero energy level for cart & pendulum
  cart.setZeroEnergyLevel(cart.getPosition().getY());
  pendulum.setZeroEnergyLevel(pendulum.getPosition().getY());

  var Icm = pendulum.momentAboutCM();
  // distance from pivot to CM on the pendulum
  //var R = otherBodyY-bods[1].cmy;
  var R = 0.5;
  var r = (Icm/(pendulum.getMass() * R)) + R;
  //console.log('Icm='+Icm+' R='+R+'  r='+r);
  // parallel axis theorem: I = Icm + m R^2
  // equation of motion:  th'' = torque / rotational inertia
  // rigid body pendulum with R = length from pivot to cm has I = Icm + m R^2
  // th'' = -R m g sin th / (Icm + m R^2)
  // ideal pendulum with length r and point mass m has I = m r^2
  // th'' = -r m g sin th / (m r^2)
  // to equate these two:
  // r / (m r^2) = R / (Icm + m R^2)
  // invert and simplify:
  // m r = (Icm + m R^2) / R
  // r = (Icm / m R) + R
  R = 0.35;
  r = (Icm/(pendulum.getMass() * R)) + R;
  //console.log('or Icm='+Icm+' R='+R+'  r='+r);
  Walls.make(this.mySim, /*width=*/6, /*height=*/4, /*thickness=*/1.0);
  this.mySim.addForceLaw(this.dampingLaw);
  this.dampingLaw.connect(this.mySim.getSimList());
  this.mySim.addForceLaw(this.gravityLaw);
  this.gravityLaw.connect(this.mySim.getSimList());
  this.mySim.setElasticity(elasticity);
  this.mySim.saveInitialState();
  this.clock.setTime(this.mySim.getTime());
  this.clock.setRealTime(this.mySim.getTime());
  this.easyScript.update();
};

/**
* @return {number}
*/
CartPendulum2App.prototype.getSpringDamping = function() {
  return this.springDamping;
};

/**
* @param {number} value
*/
CartPendulum2App.prototype.setSpringDamping = function(value) {
  if (this.springDamping != value) {
    this.springDamping = value;
    if (this.spring != null) {
      this.spring.setDamping(value);
    }
    this.broadcastParameter(CartPendulum2App.en.SPRING_DAMPING);
  }
};

/**
* @return {number}
*/
CartPendulum2App.prototype.getStiffness = function() {
  return this.stiffness;
};

/**
* @param {number} value
*/
CartPendulum2App.prototype.setStiffness = function(value) {
  if (this.stiffness != value) {
    this.stiffness = value;
    if (this.spring != null) {
      this.spring.setStiffness(value);
    }
    this.broadcastParameter(CartPendulum2App.en.STIFFNESS);
  }
};

/** @inheritDoc */
CartPendulum2App.prototype.graphSetup = function(body) {
  var cart = this.mySim.getBody('cart');
  var pendulum = this.mySim.getBody('pendulum');
  this.graph.line.setXVariable(cart.getVarsIndex()+0); // x position
  this.graph.line.setYVariable(pendulum.getVarsIndex()+4); // angle
  this.timeGraph.line1.setYVariable(cart.getVarsIndex()+0); // x position
  this.timeGraph.line2.setYVariable(pendulum.getVarsIndex()+4); // angle
};

/** Set of internationalized strings.
@typedef {{
  LENGTH: string,
  SPRING_DAMPING: string,
  STIFFNESS: string,
  CART: string,
  PENDULUM: string
  }}
*/
CartPendulum2App.i18n_strings;

/**
@type {CartPendulum2App.i18n_strings}
*/
CartPendulum2App.en = {
  LENGTH: 'spring length',
  SPRING_DAMPING: 'spring damping',
  STIFFNESS: 'spring stiffness',
  CART: 'cart',
  PENDULUM: 'pendulum'
};

/**
@private
@type {CartPendulum2App.i18n_strings}
*/
CartPendulum2App.de_strings = {
  LENGTH: 'Federl\u00e4nge',
  SPRING_DAMPING: 'Federd\u00e4mpfung',
  STIFFNESS: 'Federsteifheit',
  CART: 'Wagen',
  PENDULUM: 'Pendel'
};


/** Set of internationalized strings.
@type {CartPendulum2App.i18n_strings}
*/
CartPendulum2App.i18n = goog.LOCALE === 'de' ? CartPendulum2App.de_strings :
    CartPendulum2App.en;

}); // goog.scope
