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

goog.provide('myphysicslab.sims.engine2D.TestBodyApp');

goog.require('goog.array');
goog.require('myphysicslab.lab.controls.ChoiceControl');
goog.require('myphysicslab.lab.controls.NumericControl');
goog.require('myphysicslab.lab.engine2D.CollisionHandling');
goog.require('myphysicslab.lab.engine2D.ContactSim');
goog.require('myphysicslab.lab.model.DampingLaw');
goog.require('myphysicslab.lab.engine2D.ExtraAccel');
goog.require('myphysicslab.lab.model.GravityLaw');
goog.require('myphysicslab.lab.engine2D.RigidBodySim');
goog.require('myphysicslab.lab.engine2D.Scrim');
goog.require('myphysicslab.lab.engine2D.Shapes');
goog.require('myphysicslab.lab.engine2D.Walls');
goog.require('myphysicslab.lab.model.CollisionAdvance');
goog.require('myphysicslab.lab.model.Spring');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.sims.engine2D.Engine2DApp');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.TabLayout');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var ChoiceControl = lab.controls.ChoiceControl;
var CollisionAdvance = lab.model.CollisionAdvance;
var CollisionHandling = lab.engine2D.CollisionHandling;
var CommonControls = sims.layout.CommonControls;
var ContactSim = lab.engine2D.ContactSim;
var DampingLaw = lab.model.DampingLaw;
var DebugLevel = lab.model.CollisionAdvance.DebugLevel;
var DoubleRect = lab.util.DoubleRect;
var Engine2DApp = sims.engine2D.Engine2DApp;
var ExtraAccel = lab.engine2D.ExtraAccel;
var GravityLaw = lab.model.GravityLaw;
var NumericControl = lab.controls.NumericControl;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var RigidBodySim = lab.engine2D.RigidBodySim;
var Scrim = lab.engine2D.Scrim;
var Shapes = lab.engine2D.Shapes;
var Spring = lab.model.Spring;
var TabLayout = sims.layout.TabLayout;
var UtilityCore = lab.util.UtilityCore;
var Vector = lab.util.Vector;
var Walls = lab.engine2D.Walls;

/** TestBodyApp is meant for close observation of contacts and collisions for
debugging.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @struct
* @extends {Engine2DApp}
* @export
*/
myphysicslab.sims.engine2D.TestBodyApp = function(elem_ids) {
  var simRect = new DoubleRect(-10, -6, 10, 6);
  this.mySim = new ContactSim();
  var advance = new CollisionAdvance(this.mySim);
  Engine2DApp.call(this, elem_ids, simRect, this.mySim, advance);
  this.mySim.setExtraAccel(ExtraAccel.VELOCITY_AND_DISTANCE);
  this.dampingLaw = new DampingLaw(0, 0.15, this.simList);
  this.mySim.addForceLaw(this.dampingLaw);
  this.gravityLaw = new GravityLaw(0, this.simList);
  this.mySim.addForceLaw(this.gravityLaw);

  this.block = Shapes.makeBlock2(1, 3, TestBodyApp.en.BLOCK, TestBodyApp.i18n.BLOCK);
  this.block.setPosition(new Vector(0,  -5.49500),  -7.85398);
  this.mySim.addBody(this.block);
  this.displayList.findShape(this.block).setFillStyle('#ccf').setNameColor('gray')
      .setNameFont('12pt sans-serif').setNameRotate(Math.PI/2);

  if (1 == 1) {
    this.spring = new Spring('spring',
        this.block, new Vector(0.5, 2.7),
        Scrim.getScrim(), new Vector(-1, -2),
        /*restLength=*/0, /*stiffness=*/3.0);
    this.mySim.addForceLaw(this.spring);
    this.simList.add(this.spring);
  }

  var zel = Walls.make2(this.mySim, this.simView.getSimRect());
  this.gravityLaw.setZeroEnergyLevel(zel);

  this.addPlaybackControls();

  /** @type {!ParameterString} */
  var ps = this.mySim.getParameterString(RigidBodySim.en.COLLISION_HANDLING);
  this.addControl(new ChoiceControl(ps));
  ps = this.mySim.getParameterString(RigidBodySim.en.EXTRA_ACCEL);
  this.addControl(new ChoiceControl(ps));

  /** @type {!ParameterNumber} */
  var pn = this.dampingLaw.getParameterNumber(DampingLaw.en.DAMPING);
  this.addControl(new NumericControl(pn));
  pn = this.gravityLaw.getParameterNumber(GravityLaw.en.GRAVITY);
  this.addControl(new NumericControl(pn));
  this.watchEnergyChange(pn);

  this.addStandardControls();

  this.makeEasyScript();
  this.addURLScriptButton();
  this.graphSetup(this.mySim.getBody('block'));
};
var TestBodyApp = myphysicslab.sims.engine2D.TestBodyApp;
goog.inherits(TestBodyApp, Engine2DApp);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  TestBodyApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', dampingLaw: '+this.dampingLaw.toStringShort()
        +', gravityLaw: '+this.gravityLaw.toStringShort()
        + TestBodyApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
TestBodyApp.prototype.getClassName = function() {
  return 'TestBodyApp';
};

/** Define short-cut name replacement rules.  For example 'sim' is replaced
* by 'myApp.sim' when myName is 'myApp'.
* @param {string} myName  the name of this object, valid in global Javascript context.
* @export
*/
TestBodyApp.prototype.defineNames = function(myName) {
  TestBodyApp.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('gravityLaw|dampingLaw|block|spring',
       myName);
  this.terminal.addRegex('TestBodyApp|Engine2DApp',
       'myphysicslab.sims.engine2D', /*addToVars=*/false);
};

/** @inheritDoc */
TestBodyApp.prototype.getSubjects = function() {
  var subjects = TestBodyApp.superClass_.getSubjects.call(this);
  return goog.array.concat(this.gravityLaw, this.dampingLaw, subjects);
};

/** Start the application running.
* @return {undefined}
* @export
*/
TestBodyApp.prototype.setup = function() {
  var t = this.terminal;
  t.eval('//setup commands');
  t.eval('gravityLaw.setGravity(8);');
  t.eval('dampingLaw.setDamping(0);');
  t.eval('sim.setElasticity(0.2);');
  t.eval('sim.setCollisionHandling(CollisionHandling.SERIAL_GROUPED_LASTPASS);');
  t.eval('sim.setShowForces(true);');
  t.eval('simView.setSimRect(new DoubleRect(-1.73762, -6.09127, -1.29572, -5.82613));');
  t.eval('clock.setTimeRate(0.1);');
  t.eval('statusList.add(displayClock);');
  t.eval('statusList.add(energyGraph);');
  t.eval('simRun.setTimeStep(0.01);');
  t.eval('block.setZeroEnergyLevel(-4.5);');
  t.eval('//end of setup commands');
  TestBodyApp.superClass_.setup.call(this);
};

/** Set of internationalized strings.
@typedef {{
  BLOCK: string
  }}
*/
TestBodyApp.i18n_strings;

/**
@type {TestBodyApp.i18n_strings}
*/
TestBodyApp.en = {
  BLOCK: 'block'
};

/**
@private
@type {TestBodyApp.i18n_strings}
*/
TestBodyApp.de_strings = {
  BLOCK: 'Block'
};

/** Set of internationalized strings.
@type {TestBodyApp.i18n_strings}
*/
TestBodyApp.i18n = goog.LOCALE === 'de' ? TestBodyApp.de_strings :
    TestBodyApp.en;

}); // goog.scope
