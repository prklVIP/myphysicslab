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

goog.provide('myphysicslab.lab.model.SimpleAdvance');

goog.require('myphysicslab.lab.model.ODEAdvance');
goog.require('myphysicslab.lab.model.DiffEqSolver');
goog.require('myphysicslab.lab.model.ODESim');
goog.require('myphysicslab.lab.model.RungeKutta');
goog.require('myphysicslab.lab.util.GenericEvent');
goog.require('myphysicslab.lab.util.UtilityCore');

goog.scope(function() {

var ODEAdvance = myphysicslab.lab.model.ODEAdvance;
var ODESim = myphysicslab.lab.model.ODESim;
var DiffEqSolver = myphysicslab.lab.model.DiffEqSolver;
var RungeKutta = myphysicslab.lab.model.RungeKutta;
var GenericEvent = myphysicslab.lab.util.GenericEvent;
var UtilityCore = myphysicslab.lab.util.UtilityCore;

/** Advances an {@link myphysicslab.lab.model.ODESim ODESim} in a single step without
doing any collision handling.

The {@link #advance} method calls {@link myphysicslab.lab.model.DiffEqSolver#step} to
advance the Simulation state, and then
{@link myphysicslab.lab.model.Simulation#modifyObjects} to update the state of the
{@link myphysicslab.lab.model.SimObjects SimObjects}.

* @param {!myphysicslab.lab.model.ODESim} sim the Simulation to advance thru time
* @param {!myphysicslab.lab.model.DiffEqSolver=} opt_diffEqSolver the DiffEqSolver to
*     use for advancing the simulation; default is RungeKutta.
* @constructor
* @final
* @struct
* @implements {myphysicslab.lab.model.ODEAdvance}
*/
myphysicslab.lab.model.SimpleAdvance = function(sim, opt_diffEqSolver) {
  /**
  * @type {!myphysicslab.lab.model.ODESim}
  * @private
  */
  this.sim_ = sim;
  /**
  * @type {!myphysicslab.lab.model.DiffEqSolver}
  * @private
  */
  this.odeSolver_ = opt_diffEqSolver || new RungeKutta(sim);
  /** Default amount of time to advance the simulation, in seconds.
  * @type {number}
  * @private
  */
  this.timeStep_ = 0.025;
};
var SimpleAdvance = myphysicslab.lab.model.SimpleAdvance;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  SimpleAdvance.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', odeSolver_: '+this.odeSolver_.toStringShort()
        +'}';
  };

  /** @inheritDoc */
  SimpleAdvance.prototype.toStringShort = function() {
    return 'SimpleAdvance{sim_: '+this.sim_.toStringShort()+'}';
  };
};

/** @inheritDoc */
SimpleAdvance.prototype.advance = function(timeStep, opt_memoList) {
  this.sim_.getSimList().removeTemporary(this.sim_.getTime());
  var err = this.odeSolver_.step(timeStep);
  if (err != null) {
    throw new Error('error during advance '+err);
  }
  this.sim_.modifyObjects();
  if (opt_memoList !== undefined) {
    opt_memoList.memorize();
  }
};

/** @inheritDoc */
SimpleAdvance.prototype.getDiffEqSolver = function() {
  return this.odeSolver_;
};

/** @inheritDoc */
SimpleAdvance.prototype.getTime = function() {
  return this.sim_.getTime();
};

/** @inheritDoc */
SimpleAdvance.prototype.getTimeStep = function() {
  return this.timeStep_;
};

/** @inheritDoc */
SimpleAdvance.prototype.reset = function() {
  this.sim_.reset();
};

/** @inheritDoc */
SimpleAdvance.prototype.setDiffEqSolver = function(diffEqSolver) {
  this.odeSolver_ = diffEqSolver;
};

/** @inheritDoc */
SimpleAdvance.prototype.setTimeStep = function(timeStep) {
  this.timeStep_ = timeStep;
};

}); // goog.scope
