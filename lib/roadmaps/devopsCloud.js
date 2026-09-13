// Update 63 — Career Roadmap, sub-step 8 of its own mini-roadmap
// (tracked in updates.md). Same rules as the other three roles: 100%
// original writing, never copied/adapted from roadmap.sh or any other
// roadmap site, every resource link points to official documentation
// only.
export const DEVOPS_CLOUD_ROADMAP = {
  role: 'DevOps & Cloud',
  description:
    'From Linux and scripting fundamentals through cloud platforms, containers, and the automation that ties it all together — the path most DevOps & Cloud postings actually ask for today.',
  stages: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The base every DevOps role runs on, regardless of which cloud or tools come next.',
      topics: [
        {
          id: 'linux',
          title: 'Linux',
          tier: 'must',
          skillMatch: ['Linux'],
          blurb: 'Almost everything in this field eventually runs on a Linux server — comfort with it is non-negotiable.',
          resource: { label: 'Ubuntu Server documentation', url: 'https://documentation.ubuntu.com/server/' },
        },
        {
          id: 'bash',
          title: 'Bash/Shell scripting',
          tier: 'must',
          skillMatch: ['Bash/Shell'],
          blurb: "Automating anything on a server usually starts with a shell script, not a full program.",
          resource: { label: 'GNU Bash manual', url: 'https://www.gnu.org/software/bash/manual/bash.html' },
        },
        {
          id: 'git',
          title: 'Git & version control',
          tier: 'must',
          skillMatch: ['Git'],
          blurb: 'Infrastructure code gets versioned and reviewed the same way application code does.',
          resource: { label: 'Git documentation', url: 'https://git-scm.com/doc' },
        },
      ],
    },
    {
      id: 'cloud-platforms',
      title: 'Pick a cloud platform',
      description:
        'AWS is the single most-requested platform in current postings by a wide margin — the others are genuinely solid, just less commonly the primary requirement.',
      topics: [
        {
          id: 'aws',
          title: 'AWS',
          tier: 'must',
          skillMatch: ['AWS'],
          blurb: 'Compute, storage, and managed databases first — the huge surface area of individual services comes with time.',
          resource: { label: 'AWS documentation', url: 'https://docs.aws.amazon.com/' },
        },
        {
          id: 'gcp',
          title: 'Google Cloud (GCP)',
          tier: 'optional',
          skillMatch: ['Google Cloud (GCP)'],
          blurb: 'Strong in data/ML-heavy organizations specifically, and at companies already using Google Workspace.',
          resource: { label: 'Google Cloud documentation', url: 'https://cloud.google.com/docs' },
        },
        {
          id: 'azure',
          title: 'Azure',
          tier: 'optional',
          skillMatch: ['Azure'],
          blurb: 'Common wherever a company is already invested in the Microsoft ecosystem.',
          resource: { label: 'Azure documentation', url: 'https://learn.microsoft.com/en-us/azure/' },
        },
      ],
    },
    {
      id: 'containers',
      title: 'Containers & orchestration',
      description: 'How modern applications actually get packaged and run at scale.',
      topics: [
        {
          id: 'docker',
          title: 'Docker',
          tier: 'must',
          skillMatch: ['Docker'],
          blurb: 'Packaging an app so it runs the same way everywhere — the starting point for almost everything else in this stage.',
          resource: { label: 'Docker documentation', url: 'https://docs.docker.com/' },
        },
        {
          id: 'kubernetes',
          title: 'Kubernetes',
          tier: 'important',
          skillMatch: ['Kubernetes'],
          blurb: 'Container orchestration at scale — genuinely important once a company runs more than a handful of services.',
          resource: { label: 'Kubernetes documentation', url: 'https://kubernetes.io/docs/home/' },
        },
      ],
    },
    {
      id: 'automation',
      title: 'CI/CD & automation',
      description: 'Making deployment a routine, boring, repeatable event instead of a stressful one.',
      topics: [
        {
          id: 'cicd',
          title: 'CI/CD pipelines',
          tier: 'must',
          skillMatch: ['CI/CD'],
          blurb: 'Automated testing and deployment on every push — the core practice this whole stage is organized around.',
          resource: { label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' },
        },
        {
          id: 'github-actions',
          title: 'GitHub Actions',
          tier: 'important',
          skillMatch: ['GitHub Actions'],
          blurb: 'The most commonly requested CI/CD tool right now, largely because so much code already lives on GitHub.',
          resource: { label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' },
        },
        {
          id: 'jenkins',
          title: 'Jenkins',
          tier: 'optional',
          skillMatch: ['Jenkins'],
          blurb: 'Still powers a lot of existing pipelines at larger, older organizations specifically.',
          resource: { label: 'Jenkins documentation', url: 'https://www.jenkins.io/doc/' },
        },
        {
          id: 'ansible',
          title: 'Ansible',
          tier: 'optional',
          skillMatch: ['Ansible'],
          blurb: 'Configuration management — keeping a fleet of servers in a known, consistent state.',
          resource: { label: 'Ansible documentation', url: 'https://docs.ansible.com/' },
        },
      ],
    },
    {
      id: 'infrastructure-as-code',
      title: 'Infrastructure as code',
      description: 'Defining servers and cloud resources as reviewable, version-controlled code instead of manual clicks.',
      topics: [
        {
          id: 'terraform',
          title: 'Terraform',
          tier: 'important',
          skillMatch: ['Terraform'],
          blurb: 'The most commonly requested infrastructure-as-code tool, and it works across every major cloud provider.',
          resource: {
            label: 'Terraform documentation',
            url: 'https://developer.hashicorp.com/terraform/docs',
          },
        },
      ],
    },
    {
      id: 'web-serving',
      title: 'Web servers & networking',
      description: 'Getting traffic to the right place, reliably.',
      topics: [
        {
          id: 'nginx',
          title: 'Nginx',
          tier: 'important',
          skillMatch: ['Nginx'],
          blurb: 'Reverse proxying, load balancing, and serving static content — one of the most common pieces in a real deployment.',
          resource: { label: 'Nginx documentation', url: 'https://nginx.org/en/docs/' },
        },
      ],
    },
  ],
};
