import baseOptions from "./ormconfig.json";

export default baseOptions.map((option) => {
  return {
    ...option,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    cli: { migrationsDir: "src/migrations" },
  };
});
