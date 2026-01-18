import random
import time
import csv
from dataclasses import dataclass
from typing import List, Tuple, Dict

# Plotting is used only to generate the required convergence plots (not a GA library).
import matplotlib.pyplot as plt


BIT_LENGTH = 32


@dataclass
class GAParams:
    population_size: int = 200
    crossover_rate: float = 0.80
    mutation_rate: float = 0.01  # per gene (bit flip probability)
    tournament_k: int = 3
    max_generations: int = 5000


def random_bitstring(n: int) -> List[int]:
    return [random.randint(0, 1) for _ in range(n)]


def fitness(candidate: List[int], target: List[int]) -> int:
    # Fitness = number of matching bits (0..32)
    return sum(1 for c, t in zip(candidate, target) if c == t)


def tournament_selection(population: List[List[int]], fitnesses: List[int], k: int) -> List[int]:
    # Pick k random individuals and return the best among them.
    best_idx = None
    best_fit = -1
    for _ in range(k):
        idx = random.randrange(len(population))
        if fitnesses[idx] > best_fit:
            best_fit = fitnesses[idx]
            best_idx = idx
    return population[best_idx][:]  # copy


def single_point_crossover(a: List[int], b: List[int]) -> Tuple[List[int], List[int]]:
    # Split at a point in [1, n-1]
    n = len(a)
    cut = random.randint(1, n - 1)
    child1 = a[:cut] + b[cut:]
    child2 = b[:cut] + a[cut:]
    return child1, child2


def mutate(bits: List[int], mutation_rate: float) -> None:
    # Bit-flip mutation
    for i in range(len(bits)):
        if random.random() < mutation_rate:
            bits[i] = 1 - bits[i]


def run_ga_once(target: List[int], params: GAParams, run_id: str) -> Dict:
    # Initialize population
    population = [random_bitstring(BIT_LENGTH) for _ in range(params.population_size)]

    start_time = time.perf_counter()
    history_rows = []  # gen, best_fit, avg_fit

    for gen in range(params.max_generations + 1):
        fits = [fitness(ind, target) for ind in population]
        best_fit = max(fits)
        avg_fit = sum(fits) / len(fits)
        history_rows.append((gen, best_fit, avg_fit))

        if best_fit == BIT_LENGTH:
            elapsed = time.perf_counter() - start_time
            best_ind = population[fits.index(best_fit)]
            return {
                "found": True,
                "generations": gen,
                "time_sec": elapsed,
                "best_individual": best_ind,
                "history": history_rows,
                "run_id": run_id,
            }

        # Create next generation
        new_population = []

        # Elitism (keep best 1) - minimal and common; improves stability.
        elite = population[fits.index(best_fit)][:]
        new_population.append(elite)

        while len(new_population) < params.population_size:
            parent1 = tournament_selection(population, fits, params.tournament_k)
            parent2 = tournament_selection(population, fits, params.tournament_k)

            if random.random() < params.crossover_rate:
                child1, child2 = single_point_crossover(parent1, parent2)
            else:
                child1, child2 = parent1[:], parent2[:]

            mutate(child1, params.mutation_rate)
            mutate(child2, params.mutation_rate)

            new_population.append(child1)
            if len(new_population) < params.population_size:
                new_population.append(child2)

        population = new_population

    elapsed = time.perf_counter() - start_time
    # If not found, return best attempt info
    fits = [fitness(ind, target) for ind in population]
    best_fit = max(fits)
    best_ind = population[fits.index(best_fit)]
    return {
        "found": False,
        "generations": params.max_generations,
        "time_sec": elapsed,
        "best_individual": best_ind,
        "history": history_rows,
        "run_id": run_id,
    }


def bitlist_to_str(bits: List[int]) -> str:
    return "".join(str(b) for b in bits)


def save_history_csv(history: List[Tuple[int, int, float]], filepath: str) -> None:
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["generation", "best_fitness", "avg_fitness"])
        for gen, best_fit, avg_fit in history:
            w.writerow([gen, best_fit, f"{avg_fit:.4f}"])


def plot_convergence_curves(curves: Dict[str, List[Tuple[int, int, float]]], filepath: str) -> None:
    # Plot best fitness over generations for multiple curves
    plt.figure()
    for label, hist in curves.items():
        gens = [row[0] for row in hist]
        bests = [row[1] for row in hist]
        plt.plot(gens, bests, label=label)

    plt.xlabel("Generation")
    plt.ylabel("Best Fitness (0..32)")
    plt.title("GA Convergence (Best Fitness vs Generation)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(filepath, dpi=200)
    plt.close()


def tuning_experiment() -> None:
    # Generate target passcode
    target = random_bitstring(BIT_LENGTH)
    print("Target Passcode (hidden in real attack simulation; shown here for project transparency):")
    print(bitlist_to_str(target))

    base = GAParams()

    # Parameter tuning: vary mutation rate (example set)
    mutation_rates = [0.005, 0.01, 0.02, 0.05]
    trials_per_setting = 5

    summary_path = "tuning_summary.csv"
    with open(summary_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["setting", "trial", "found", "generations", "time_sec"])

        for mr in mutation_rates:
            curves_for_plot = {}
            gens_list = []
            times_list = []
            found_count = 0

            for t in range(1, trials_per_setting + 1):
                params = GAParams(
                    population_size=base.population_size,
                    crossover_rate=base.crossover_rate,
                    mutation_rate=mr,
                    tournament_k=base.tournament_k,
                    max_generations=base.max_generations,
                )

                run_id = f"mr_{mr}_trial_{t}"
                result = run_ga_once(target, params, run_id)

                w.writerow([f"mutation_rate={mr}", t, result["found"], result["generations"], f"{result['time_sec']:.6f}"])

                # Save per-run convergence history (required: store convergence rate in a file)
                history_csv = f"convergence_{run_id}.csv"
                save_history_csv(result["history"], history_csv)

                # Keep one curve for plotting (best fitness curve). To keep it simple, plot trial 1 only per setting.
                if t == 1:
                    curves_for_plot[f"mutation={mr}"] = result["history"]

                if result["found"]:
                    found_count += 1
                    gens_list.append(result["generations"])
                    times_list.append(result["time_sec"])

                print(f"[{run_id}] found={result['found']} gens={result['generations']} time={result['time_sec']:.3f}s "
                      f"best={fitness(result['best_individual'], target)}/32")

            # Plot convergence for this setting (trial 1)
            plot_path = f"plot_convergence_mutation_{mr}.png"
            plot_convergence_curves(curves_for_plot, plot_path)

            if found_count > 0:
                avg_gens = sum(gens_list) / len(gens_list)
                avg_time = sum(times_list) / len(times_list)
                print(f"Mutation {mr}: success {found_count}/{trials_per_setting}, avg gens={avg_gens:.1f}, avg time={avg_time:.3f}s")
            else:
                print(f"Mutation {mr}: success 0/{trials_per_setting} (consider increasing max_generations or adjusting params)")

    print("\nSaved:")
    print(f"- {summary_path} (tuning results)")
    print("- convergence_*.csv (per-run convergence histories)")
    print("- plot_convergence_mutation_*.png (convergence plots)")


def single_run_demo() -> None:
    # A single run example (useful for screenshots)
    target = random_bitstring(BIT_LENGTH)
    params = GAParams(population_size=200, crossover_rate=0.80, mutation_rate=0.01, tournament_k=3, max_generations=5000)

    print("Target Passcode:")
    print(bitlist_to_str(target))

    result = run_ga_once(target, params, "single_run")

    save_history_csv(result["history"], "convergence_single_run.csv")
    plot_convergence_curves({"single_run": result["history"]}, "plot_single_run.png")

    print("\nResult:")
    print(f"Found: {result['found']}")
    print(f"Generations: {result['generations']}")
    print(f"Time (sec): {result['time_sec']:.6f}")
    print(f"Best Individual: {bitlist_to_str(result['best_individual'])}")
    print(f"Best Fitness: {fitness(result['best_individual'], target)}/32")
    print("\nSaved: convergence_single_run.csv, plot_single_run.png")


if __name__ == "__main__":
    # Choose one:
    # 1) single_run_demo() for a quick run + screenshot files
    # 2) tuning_experiment() for parameter tuning analysis + multiple plots
    #single_run_demo()
     tuning_experiment()
