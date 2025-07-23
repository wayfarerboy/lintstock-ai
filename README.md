# Lintstock AI

<p align="center">
  A chat application for Lintstock, designed to interrogate company reports and generate insights.
</p>

<br/>

## Overview

Lintstock AI is a chat application that uses a modular system to extend its knowledge bases and AI agents. This allows it to interrogate Lintstock's reports, providing valuable insights, statistics, and generating new reports from the sourced data.

## Features

- **Modular Architecture**: Easily extendable knowledge bases and AI agents.
- **Intelligent Interrogation**: Chat with your reports to extract key information and data points.
- **Report Generation**: Automatically generate statistics and new reports from underlying data.
- **Next.js 14+**: Built with the latest features of the Next.js App Router.
- **Vercel AI SDK**: For state-of-the-art language model integration.
- **Data Persistence**: Utilizes Neon Serverless Postgres for chat history and user data.
- **Authentication**: Secure user authentication managed by Auth.js.

## Running locally

To run Lintstock AI locally, you will need to set up the environment variables defined in `.env.example`.

> **Note**: You should not commit your `.env` file to version control, as it contains sensitive secrets.

1.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```

2.  Set up your local environment variables. It's recommended to use Vercel Environment Variables, which you can pull down to a `.env` file.
    ```bash
    # Install Vercel CLI if you haven't already
    npm i -g vercel

    # Link your local project to Vercel
    vercel link

    # Download environment variables
    vercel env pull
    ```
    Alternatively, you can manually copy `.env.example` to `.env` and fill in the values.

3.  Run the development server:
    ```bash
    pnpm dev
    ```

Your application should now be running on [http://localhost:3000](http://localhost:3000).

## License

This project is licensed under the terms of the LICENSE file.
