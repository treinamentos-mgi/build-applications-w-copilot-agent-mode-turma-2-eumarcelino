import { isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const invalid = () => Object.assign(new Error('Dados de atividade inválidos.'), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw invalid();

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !isValidObjectId(userId) ||
    typeof teamId !== 'string' || !isValidObjectId(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1
  ) throw invalid();

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw Object.assign(new Error('Pessoa ou equipe não encontrada.'), { status: 400 });

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const invalid = () => Object.assign(new Error('Dados de equipe inválidos.'), { status: 400 });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw invalid();

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof mascot !== 'string' || !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !isValidObjectId(member))
  ) throw invalid();

  const existingMembers = await User.find({ _id: { $in: members } }).select('_id').lean();
  if (existingMembers.length !== new Set(members).size) throw invalid();

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw Object.assign(new Error('Pessoa não encontrada.'), { status: 404 });

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    strength: 'strength',
    walk: 'mobility',
  };
  const focus = recentActivity ? activityFocus[recentActivity.type] ?? user.fitnessGoal : user.fitnessGoal;
  const focusLabel: Record<string, string> = {
    endurance: 'resistência',
    strength: 'força',
    mobility: 'mobilidade',
  };
  const activityLabel: Record<string, string> = {
    run: 'corrida',
    cycle: 'ciclismo',
    strength: 'força',
    walk: 'caminhada',
  };
  const reason = recentActivity
    ? `Sua atividade recente de ${activityLabel[recentActivity.type] ?? 'treino'} indica foco em ${focusLabel[focus] ?? focus}.`
    : `Sua meta de condicionamento indica foco em ${focusLabel[focus] ?? focus}.`;
  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
