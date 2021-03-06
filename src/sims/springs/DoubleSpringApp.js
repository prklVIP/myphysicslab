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

goog.provide('myphysicslab.sims.springs.DoubleSpringApp');

goog.require('myphysicslab.lab.controls.ButtonControl');
goog.require('myphysicslab.lab.controls.CheckBoxControl');
goog.require('myphysicslab.lab.controls.SliderControl');
goog.require('myphysicslab.lab.model.ConcreteLine');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.SimpleAdvance');
goog.require('myphysicslab.lab.model.Spring');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.view.DisplayLine');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.DisplaySpring');
goog.require('myphysicslab.sims.layout.AbstractApp');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.TabLayout');
goog.require('myphysicslab.sims.springs.DoubleSpringSim');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var AbstractApp = sims.layout.AbstractApp;
var ButtonControl = lab.controls.ButtonControl;
var CheckBoxControl = lab.controls.CheckBoxControl;
var ChoiceControl = lab.controls.ChoiceControl;
var CommonControls = sims.layout.CommonControls;
var DisplayLine = lab.view.DisplayLine;
var DisplayShape = lab.view.DisplayShape;
var DisplaySpring = lab.view.DisplaySpring;
var DoubleRect = lab.util.DoubleRect;
var DoubleSpringSim = sims.springs.DoubleSpringSim;
var ConcreteLine = lab.model.ConcreteLine;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var PointMass = lab.model.PointMass;
var SimpleAdvance = lab.model.SimpleAdvance;
var SliderControl = lab.controls.SliderControl;
var Spring = lab.model.Spring;
var TabLayout = sims.layout.TabLayout;
var UtilityCore = lab.util.UtilityCore;

/**  DoubleSpringApp displays the simulation
{@link myphysicslab.sims.springs.DoubleSpringSim DoubleSpringSim}.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @extends {AbstractApp}
* @struct
* @export
*/
myphysicslab.sims.springs.DoubleSpringApp = function(elem_ids) {
  UtilityCore.setErrorHandler();
  var simRect = new DoubleRect(-0.5, -5, 10, 5);
  var sim = new DoubleSpringSim(/*thirdSpring=*/false);
  var advance = new SimpleAdvance(sim);
  AbstractApp.call(this, elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);
  this.layout.simCanvas.setBackground('black');

  this.protoWall = new DisplayShape().setFillStyle('lightGray');
  this.protoBlock = new DisplayShape().setFillStyle('blue');
  this.protoSpring = new DisplaySpring().setWidth(0.3).setColorCompressed('#0c0')
      .setColorExpanded('#6f6');

  this.wall1 = new DisplayShape(this.simList.getPointMass('wall1'), this.protoWall);
  this.wall2 = new DisplayShape(this.simList.getPointMass('wall2'), this.protoWall);
  this.displayList.add(this.wall1);
  this.displayList.add(this.wall2);
  this.spring1 = new DisplaySpring(this.simList.getSpring('spring1'), this.protoSpring);
  this.spring2 = new DisplaySpring(this.simList.getSpring('spring2'), this.protoSpring);
  this.spring3 = new DisplaySpring(this.simList.getSpring('spring3'), this.protoSpring);
  this.displayList.add(this.spring1);
  this.displayList.add(this.spring2);
  this.displayList.add(this.spring3);
  this.block1 = new DisplayShape(this.simList.getPointMass('block1'), this.protoBlock);
  this.block2 = new DisplayShape(this.simList.getPointMass('block2'), this.protoBlock);
  this.displayList.add(this.block1);
  this.displayList.add(this.block2);
  sim.saveInitialState();

  this.addPlaybackControls();
  /** @type {!ParameterBoolean} */
  var pb;
  /** @type {!ParameterNumber} */
  var pn;
  pn = sim.getParameterNumber(DoubleSpringSim.en.MASS1);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(DoubleSpringSim.en.MASS2);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(DoubleSpringSim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 1, /*multiply=*/false));

  pn = sim.getParameterNumber(DoubleSpringSim.en.LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(DoubleSpringSim.en.STIFFNESS);
  this.addControl(new SliderControl(pn, 0, 200, /*multiply=*/false));

  pb = sim.getParameterBoolean(DoubleSpringSim.en.THIRD_SPRING);
  this.addControl(new CheckBoxControl(pb));

  this.addStandardControls();

  /** @type {!myphysicslab.lab.controls.ButtonControl} */
  var bc = new ButtonControl(DoubleSpringSim.i18n.REST_STATE,
      goog.bind(sim.restState, sim));
  this.addControl(bc);

  this.makeEasyScript();
  this.addURLScriptButton();
};
var DoubleSpringApp = myphysicslab.sims.springs.DoubleSpringApp;
goog.inherits(DoubleSpringApp, AbstractApp);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  DoubleSpringApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', block1: '+this.block1.toStringShort()
        +', block2: '+this.block2.toStringShort()
        +', spring1: '+this.spring1.toStringShort()
        +', spring2: '+this.spring2.toStringShort()
        +', spring3: '+this.spring3.toStringShort()
        +', wall1: '+this.wall1.toStringShort()
        +', wall2: '+this.wall2.toStringShort()
        + DoubleSpringApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
DoubleSpringApp.prototype.getClassName = function() {
  return 'DoubleSpringApp';
};

/** @inheritDoc */
DoubleSpringApp.prototype.defineNames = function(myName) {
  DoubleSpringApp.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('wall1|wall2|block1|block2|spring1|spring2|spring3'
      +'|protoWall|protoBlock|protoSpring', myName);
};

}); // goog.scope
