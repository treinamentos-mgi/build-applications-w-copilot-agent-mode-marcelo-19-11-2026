import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw clientError('Informe os dados da atividade.');

  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
    throw clientError('Informe uma pessoa válida.');
  }
  if (typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) {
    throw clientError('Informe uma equipe válida.');
  }
  if (typeof type !== 'string' || !type.trim()) throw clientError('Informe o tipo de atividade.');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw clientError('A duração deve ser maior que zero.');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id'),
    Team.findById(teamId).select('_id'),
  ]);
  if (!user || !team) throw clientError('A pessoa ou equipe informada não existe.', 404);

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
  if (!isRecord(input)) throw clientError('Informe os dados da equipe.');

  const { name, mascot } = input;
  if (typeof name !== 'string' || !name.trim()) throw clientError('Informe o nome da equipe.');
  if (typeof mascot !== 'string' || !mascot.trim()) throw clientError('Informe a mascote da equipe.');

  const members = input.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))) {
    throw clientError('Informe uma lista válida de integrantes.');
  }

  const memberIds = members.map((member) => new Types.ObjectId(member));
  const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id');
  if (existingMembers.length !== memberIds.length) throw clientError('Um ou mais integrantes não existem.', 404);

  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
  if (memberIds.length > 0) {
    await Promise.all([
      Team.updateMany({ _id: { $ne: team._id } }, { $pull: { members: { $in: memberIds } } }),
      User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } }),
    ]);
  }
  return team;
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw clientError('Pessoa não encontrada.', 404);

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const activityFocus = recentActivity?.type === 'strength'
    ? 'strength'
    : recentActivity && ['run', 'cycle', 'walk'].includes(recentActivity.type)
      ? 'endurance'
      : undefined;
  const focus = workouts.some((workout) => workout.focus === user.fitnessGoal)
    ? user.fitnessGoal
    : activityFocus ?? user.fitnessGoal;
  const matchingWorkouts = workouts.filter((workout) => workout.focus === focus);
  const recommended = matchingWorkouts.length > 0 ? matchingWorkouts : workouts;
  const reason = activityFocus === focus
    ? `Recomendado com base na sua atividade recente e no foco ${focus === 'strength' ? 'de força' : 'de resistência'}.`
    : `Recomendado para apoiar sua meta de ${focus === 'strength' ? 'força' : focus === 'endurance' ? 'resistência' : focus}.`;

  return recommended.map((workout) => ({ ...workout, reason }));
}

export { User };
