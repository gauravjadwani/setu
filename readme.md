
# Splitwise App

The screen shot of the API swagger is in the dump folder.
After running the project swagger will be on http://localhost:3000/api-docs/

## Features

- **User Management**: Create users with unique IDs and list thier libilites with other users.
- **Group Management**: Create and manage groups with multiple members.
- **Expense Management**: Add expenses and split costs among group members, with percentage-based splits.
- **Liability Tracking**: Retrieve total liabilities for users, showing how much they owe or are owed.

## Technology Stack

- **Node.js**: Runtime environment for the application.
- **Express**: Web framework for building APIs.
- **Redis**: In-memory data structure store for managing data.
- **Jest**: Testing framework for unit and integration tests.
- **Docker**: Containerization platform for deployment.


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Redis](https://redis.io/download) (for local development)
- [Docker](https://www.docker.com/products/docker-desktop) (optional, for containerization)


### Installation

Configure the Docker on your machine

```bash
    git clone ${app_url}
    docker compose up
```


## Extended Features
### Authenticaton & Authorization
### Distributive Tracing/Visibility
### Scaled Database
### Support for Frontend
### Features like export dump
