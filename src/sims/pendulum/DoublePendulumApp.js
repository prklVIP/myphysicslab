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

goog.provide('myphysicslab.sims.pendulum.DoublePendulumApp');

goog.require('myphysicslab.lab.controls.SliderControl');
goog.require('myphysicslab.lab.model.ConcreteLine');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.SimpleAdvance');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayLine');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.sims.layout.AbstractApp');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.TabLayout');
goog.require('myphysicslab.sims.pendulum.DoublePendulumSim');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var SliderControl = lab.controls.SliderControl;
var AbstractApp = sims.layout.AbstractApp;
var CommonControls = sims.layout.CommonControls;
var DisplayLine = lab.view.DisplayLine;
var DisplayShape = lab.view.DisplayShape;
var DoublePendulumSim = sims.pendulum.DoublePendulumSim;
var DoubleRect = lab.util.DoubleRect;
var ConcreteLine = lab.model.ConcreteLine;
var PointMass = lab.model.PointMass;
var SimpleAdvance = lab.model.SimpleAdvance;
var TabLayout = sims.layout.TabLayout;
var Vector = lab.util.Vector;
var UtilityCore = lab.util.UtilityCore;

/** DoublePendulumApp displays the simulation
{@link myphysicslab.sims.pendulum.DoublePendulumSim DoublePendulumSim}.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @extends {AbstractApp}
* @struct
* @export
*/
sims.pendulum.DoublePendulumApp = function(elem_ids) {
  UtilityCore.setErrorHandler();
  var simRect = new DoubleRect(-2, -2.2, 2, 1.5);
  var sim = new DoublePendulumSim();
  var advance = new SimpleAdvance(sim);
  AbstractApp.call(this, elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);

  /** @type {!lab.view.DisplayLine} */
  this.rod1 = new DisplayLine(this.simList.getConcreteLine('rod1'));
  this.displayList.add(this.rod1);
  /** @type {!lab.view.DisplayLine} */
  this.rod2 = new DisplayLine(this.simList.getConcreteLine('rod2'));
  this.displayList.add(this.rod2);
  /** @type {!lab.view.DisplayShape} */
  this.bob1 = new DisplayShape(this.simList.getPointMass('bob1')).setFillStyle('blue');
  this.displayList.add(this.bob1);
  /** @type {!lab.view.DisplayShape} */
  this.bob2 = new DisplayShape(this.simList.getPointMass('bob2')).setFillStyle('blue');
  this.displayList.add(this.bob2);

  // make a dragable square to use for marking positions
  // This is a test for MouseTracker, the case where a dragable DisplayObject
  // has a SimObject that is not recognized by the Simulation's EventHandler.
  if (1 == 1) {
    /** @type {!lab.model.PointMass} */
    this.marker1 = PointMass.makeCircle(0.2, 'marker1');
    // put the object outside of the visible area, to avoid confusion
    this.marker1.setPosition(new Vector(-3, 1));
    this.marker1Shape = new DisplayShape(this.marker1).setFillStyle('')
        .setStrokeStyle('red');
    this.marker1Shape.setDragable(true);
    this.displayList.add(this.marker1Shape);
  }

  this.graph.line.setXVariable(0); // angle-1
  this.graph.line.setYVariable(2); // angle-2
  // test of polar graph feature
  if (0 == 1) {
    this.graph.line.xTransform = function(x,y) { return y*Math.cos(x); };
    this.graph.line.yTransform = function(x,y) { return y*Math.sin(x); };
  }
  this.addPlaybackControls();
  /** @type {!lab.util.ParameterNumber} */
  var pn;
  pn = sim.getParameterNumber(DoublePendulumSim.en.ROD_1_LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(DoublePendulumSim.en.ROD_2_LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(DoublePendulumSim.en.MASS_1);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(DoublePendulumSim.en.MASS_2);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(DoublePendulumSim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));

  this.addStandardControls();

  this.makeEasyScript();
  this.addURLScriptButton();
};
var DoublePendulumApp = sims.pendulum.DoublePendulumApp;
goog.inherits(DoublePendulumApp, AbstractApp);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  DoublePendulumApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', bob1: '+this.bob1.toStringShort()
        +', bob2: '+this.bob2.toStringShort()
        +', rod1: '+this.rod2.toStringShort()
        +', rod2: '+this.rod2.toStringShort()
        + DoublePendulumApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
DoublePendulumApp.prototype.getClassName = function() {
  return 'DoublePendulumApp';
};

/** @inheritDoc */
DoublePendulumApp.prototype.defineNames = function(myName) {
  DoublePendulumApp.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('rod1|rod2|bob1|bob2',
      myName);
};

}); // goog.scope
