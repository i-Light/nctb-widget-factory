import { ProjectileSim } from './ProjectileSim/ProjectileSim';
import { VectorRiverBoatSim } from './VectorRiverBoatSim/VectorRiverBoatSim';
import { KirchhoffCircuitBoard } from './KirchhoffCircuitBoard/KirchhoffCircuitBoard';
import { RayOpticsCanvas } from './RayOpticsCanvas/RayOpticsCanvas';
import { KinematicsGraphMatcher } from './KinematicsGraphMatcher/KinematicsGraphMatcher';
import { FormulaBalancer } from './FormulaBalancer/FormulaBalancer';

export type PhysicsWidgetName =
  | 'ProjectileSim'
  | 'VectorRiverBoatSim'
  | 'KirchhoffCircuitBoard'
  | 'RayOpticsCanvas'
  | 'KinematicsGraphMatcher'
  | 'FormulaBalancer';

export const PHYSICS_WIDGET_REGISTRY = {
  ProjectileSim,
  VectorRiverBoatSim,
  KirchhoffCircuitBoard,
  RayOpticsCanvas,
  KinematicsGraphMatcher,
  FormulaBalancer,
} as const;
