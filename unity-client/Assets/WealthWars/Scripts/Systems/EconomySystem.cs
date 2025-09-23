namespace WealthWars.Systems {
    public class EconomySystem {
        public decimal PlayerWealth { get; private set; }
        public void AddWealth(decimal amount) => PlayerWealth += amount;
    }
}
