const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

/**
 * Resolves the calling user's unique ID via their Puter auth context.
 * Returns null if the identity cannot be confirmed.
 */
const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();
    return user?.uuid ?? user?.id ?? null;
  } catch {
    return null;
  }
};

/**
 * Builds a KV key that is scoped to both the user and the project.
 * Format: roomify_project_<userId>_<projectId>
 */
const makeKey = (userId, projectId) =>
  `${PROJECT_PREFIX}${encodeURIComponent(String(userId))}:${encodeURIComponent(String(projectId))}`;

/**
 * Builds the per-user KV prefix used for listing.
 * Format: roomify_project_<userId>_
 */
const makePrefix = (userId) =>
  `${PROJECT_PREFIX}${encodeURIComponent(String(userId))}:`;

// ---------------------------------------------------------------------------

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Unauthorized");
    }

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage) {
      return jsonError(400, "Project id and source image are required!");
    }

    const payload = {
      ...project,
      ownerId: userId,
      updatedAt: new Date().toISOString(),
    };

    const key = makeKey(userId, project.id);

    await userPuter.kv.set(key, payload);

    return {
      saved: true,
      id: project.id,
      project: payload,
    };
  } catch (error) {
    console.error("[/api/projects/save] Unexpected error:", error);
    return jsonError(500, "An unexpected error occurred. Please try again.");
  }
});

// ---------------------------------------------------------------------------

router.get("/api/projects/list", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Unauthorized");
    }

    const keys = await userPuter.kv.list(makePrefix(userId), true);
    const projects = keys.map(({ value }) => ({
      ...value,
      isPublic: value.isPublic ?? value.visibility === "public",
    }));

    return { projects };
  } catch (error) {
    console.error("[/api/projects/list] Unexpected error:", error);
    return jsonError(500, "An unexpected error occurred. Please try again.");
  }
});

// ---------------------------------------------------------------------------

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return jsonError(400, "Missing required parameter: id");
    }

    const key = makeKey(userId, id);
    const project = await userPuter.kv.get(key);

    if (!project) {
      return jsonError(404, "Project not found");
    }

    return { project };
  } catch (error) {
    console.error("[/api/projects/get] Unexpected error:", error);
    return jsonError(500, "An unexpected error occurred. Please try again.");
  }
});
