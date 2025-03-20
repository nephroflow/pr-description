import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFileSync } from "fs";

async function run() {
  const content = getInput("content", { required: true });
  const contentIsFilePath = getInput("contentIsFilePath");
  const regex = getInput("regex") || "---.*";
  const regexFlags = getInput("regexFlags") || "";
  const token = getInput("token", { required: true });

  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/");
  const prNumber = context.payload.issue.number;

  const octokit = getOctokit(token);

  const { data } = await octokit.rest.pulls.get({
    owner: repoOwner,
    repo: repoName,
    pull_number: prNumber,
  });

  body = data.body;

  let output = content;
  if (contentIsFilePath && contentIsFilePath === "true") {
    output = readFileSync(content).toString("utf-8");
  }

  const re = RegExp(regex, regexFlags);
  if (body && body.match(re)) {
    body = body.replace(re, output);
  } else if (body) {
    body += output;
  } else {
    body = output;
  }

  await octokit.rest.pulls.update({
    owner: repoOwner,
    repo: repoName,
    body: body,
    pull_number: prNumber,
  });
}

run();
