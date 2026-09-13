// Update 62 — Career Roadmap, sub-step 7 of its own mini-roadmap
// (tracked in updates.md). Same rules as lib/roadmaps/frontend.js and
// backend.js: 100% original writing, never copied/adapted from
// roadmap.sh or any other roadmap site, every resource link points to
// official documentation only.
export const DATA_ML_ROADMAP = {
  role: 'Data & ML',
  description:
    'From Python and SQL fundamentals through data analysis, classical machine learning, deep learning, and the specialized domains built on top of it — the path most Data & ML postings actually ask for today.',
  stages: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The base every data role builds on, before any modeling.',
      topics: [
        {
          id: 'python',
          title: 'Python',
          tier: 'must',
          skillMatch: ['Python'],
          blurb: 'The default language across nearly every part of this field — analysis, ML, and data engineering alike.',
          resource: { label: 'Python documentation', url: 'https://docs.python.org/3/' },
        },
        {
          id: 'sql',
          title: 'SQL',
          tier: 'must',
          skillMatch: ['SQL'],
          blurb: 'Most real-world data still lives in a database — querying it well is non-negotiable.',
          resource: {
            label: 'PostgreSQL tutorial',
            url: 'https://www.postgresql.org/docs/current/tutorial.html',
          },
        },
        {
          id: 'git',
          title: 'Git & version control',
          tier: 'important',
          skillMatch: ['Git'],
          blurb: 'Increasingly expected even for research-leaning roles, not just engineering ones.',
          resource: { label: 'Git documentation', url: 'https://git-scm.com/doc' },
        },
        {
          id: 'r',
          title: 'R',
          tier: 'optional',
          skillMatch: ['R'],
          blurb: 'Still common in academia, biostatistics, and some research-heavy industries specifically.',
          resource: { label: 'R documentation', url: 'https://www.r-project.org/other-docs.html' },
        },
      ],
    },
    {
      id: 'data-analysis',
      title: 'Data analysis & visualization',
      description: 'Understanding and communicating what the data actually says, before modeling it.',
      topics: [
        {
          id: 'pandas',
          title: 'Pandas & data analysis',
          tier: 'must',
          skillMatch: ['Pandas', 'Data Analysis'],
          blurb: 'The standard toolkit for cleaning, reshaping, and exploring tabular data in Python.',
          resource: { label: 'Pandas documentation', url: 'https://pandas.pydata.org/docs/' },
        },
        {
          id: 'numpy',
          title: 'NumPy',
          tier: 'important',
          skillMatch: ['NumPy'],
          blurb: 'The array/numerical foundation most of the Python data stack (including Pandas) is built on top of.',
          resource: { label: 'NumPy documentation', url: 'https://numpy.org/doc/stable/' },
        },
        {
          id: 'tableau',
          title: 'Tableau',
          tier: 'important',
          skillMatch: ['Tableau'],
          blurb: 'The most commonly requested dedicated BI/visualization tool in current Data postings.',
          resource: { label: 'Tableau Help', url: 'https://help.tableau.com/current/pro/desktop/en-us/' },
        },
        {
          id: 'power-bi',
          title: 'Power BI',
          tier: 'optional',
          skillMatch: ['Power BI'],
          blurb: 'Common wherever a company is already invested in the Microsoft ecosystem.',
          resource: { label: 'Power BI documentation', url: 'https://learn.microsoft.com/en-us/power-bi/' },
        },
      ],
    },
    {
      id: 'machine-learning',
      title: 'Machine learning fundamentals',
      description: 'Classical ML — usually the actual day-to-day work behind the "AI" label.',
      topics: [
        {
          id: 'ml-fundamentals',
          title: 'Machine learning fundamentals',
          tier: 'must',
          skillMatch: ['Machine Learning'],
          blurb: 'Regression, classification, evaluation metrics, and the classical algorithms most models still build on.',
          resource: { label: 'scikit-learn documentation', url: 'https://scikit-learn.org/stable/user_guide.html' },
        },
      ],
    },
    {
      id: 'deep-learning',
      title: 'Deep learning',
      description: 'Where a lot of current "AI" hype actually lives, and genuinely useful for the right problems.',
      topics: [
        {
          id: 'tensorflow',
          title: 'TensorFlow',
          tier: 'important',
          skillMatch: ['TensorFlow', 'Deep Learning'],
          blurb: "Google's deep learning framework — common in production ML pipelines specifically.",
          resource: { label: 'TensorFlow documentation', url: 'https://www.tensorflow.org/learn' },
        },
        {
          id: 'pytorch',
          title: 'PyTorch',
          tier: 'important',
          skillMatch: ['PyTorch', 'Deep Learning'],
          blurb: 'The dominant framework in research and most new NLP/computer vision work today.',
          resource: { label: 'PyTorch documentation', url: 'https://pytorch.org/docs/stable/index.html' },
        },
      ],
    },
    {
      id: 'specialized-domains',
      title: 'Specialized domains',
      description: 'Deeper, narrower tracks — pick based on the kind of role you actually want, not both by default.',
      topics: [
        {
          id: 'nlp',
          title: 'NLP (Natural Language Processing)',
          tier: 'optional',
          skillMatch: ['NLP'],
          blurb: 'Text classification, embeddings, and increasingly, working with large language models directly.',
          resource: { label: 'Hugging Face documentation', url: 'https://huggingface.co/docs' },
        },
        {
          id: 'computer-vision',
          title: 'Computer vision',
          tier: 'optional',
          skillMatch: ['Computer Vision'],
          blurb: 'Image classification, object detection — a genuinely different specialty from NLP, not a natural add-on.',
          resource: { label: 'OpenCV documentation', url: 'https://docs.opencv.org/4.x/' },
        },
      ],
    },
    {
      id: 'data-engineering',
      title: 'Data engineering & pipelines',
      description: 'Getting data to the people and models that need it, reliably and at scale.',
      topics: [
        {
          id: 'data-engineering-etl',
          title: 'Data engineering & ETL pipelines',
          tier: 'important',
          skillMatch: ['Data Engineering', 'ETL'],
          blurb: 'Moving and transforming data reliably — the unglamorous work that makes everything else possible.',
          resource: { label: 'Apache Airflow documentation', url: 'https://airflow.apache.org/docs/' },
        },
        {
          id: 'apache-spark',
          title: 'Apache Spark',
          tier: 'optional',
          skillMatch: ['Apache Spark'],
          blurb: "The standard tool once a dataset is too large for Pandas to handle comfortably on one machine.",
          resource: { label: 'Apache Spark documentation', url: 'https://spark.apache.org/docs/latest/' },
        },
      ],
    },
  ],
};
