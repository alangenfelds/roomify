const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message, data = {}) => {
  return new Response(JSON.stringify({ error: message, ...data }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage) {
      return jsonError(400, "Project id and source image are required!");
    }

    const payload = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    const key = `${PROJECT_PREFIX}$_${project.id}`;

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

router.get("/api/projects/list", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    // const keys = await userPuter.kv.list(`${PROJECT_PREFIX}*`);

    // const projects = await Promise.all(
    //   keys.map((key) => userPuter.kv.get(key)),
    // );

    const keys = await userPuter.kv.list(PROJECT_PREFIX, true);
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

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return jsonError(400, "Missing required parameter: id");
    }

    const key = `${PROJECT_PREFIX}$_${id}`;
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
