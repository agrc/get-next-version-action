import { beforeEach, describe, expect, test, vi } from 'vitest';

const setOutput = vi.fn();
const setFailed = vi.fn();
const info = vi.fn();
const debug = vi.fn();
const getInput = vi.fn();
const getBooleanInput = vi.fn();
const graphql = vi.fn();
const bump = vi.fn();
const loadPreset = vi.fn();

class MockBumper {
  loadPreset = loadPreset;
  bump = bump;
}

vi.mock('@actions/core', () => ({
  debug,
  getBooleanInput,
  getInput,
  info,
  setFailed,
  setOutput,
}));

vi.mock('@actions/github', () => ({
  context: {
    payload: {
      repository: {
        name: 'repo-from-context',
        owner: {
          login: 'owner-from-context',
        },
      },
    },
  },
  getOctokit: vi.fn(() => ({ graphql })),
}));

vi.mock('conventional-recommended-bump', () => ({
  Bumper: vi.fn(function MockBumperConstructor() {
    return new MockBumper();
  }),
}));

describe('index', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    getInput.mockReturnValue('fake-token');
    getBooleanInput.mockReturnValue(false);

    loadPreset.mockImplementation(function (this: MockBumper) {
      return this;
    });
    bump.mockResolvedValue({ releaseType: 'minor' });

    graphql.mockResolvedValue({
      repository: {
        releases: {
          edges: [
            {
              node: {
                id: '1',
                isPrerelease: false,
                tag: { name: 'v1.0.0' },
              },
            },
          ],
        },
      },
    });

    delete process.env.ACT;
  });

  test('sets outputs from latest release and recommended bump', async () => {
    await import('./index');

    await vi.waitFor(() => {
      expect(setOutput).toHaveBeenCalledWith('version', '1.1.0');
    });

    expect(setFailed).not.toHaveBeenCalled();
    expect(setOutput).toHaveBeenCalledWith('version', '1.1.0');
    expect(setOutput).toHaveBeenCalledWith('current-version-number', '1.0.0');
    expect(setOutput).toHaveBeenCalledWith('major', 1);
    expect(setOutput).toHaveBeenCalledWith('minor', 1);
    expect(setOutput).toHaveBeenCalledWith('patch', 0);
  });

  test('marks the action as failed when a dependency throws', async () => {
    graphql.mockRejectedValue(new Error('graphql failed'));

    await import('./index');

    await vi.waitFor(() => {
      expect(setFailed).toHaveBeenCalledWith('graphql failed');
    });
  });
});
