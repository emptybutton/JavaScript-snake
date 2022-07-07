import click

from app import app, db as _db


@click.group()
def main() -> None:
    pass


@main.group()
def db():
    pass


@db.command()
def init() -> None:
    with app.test_request_context():
        _db.create_all()


if __name__ == "__main__":
    main()
