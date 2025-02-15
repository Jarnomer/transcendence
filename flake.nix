{
  description = "Transcendence Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
    }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      forAllSystems =
        f:
        builtins.listToAttrs (
          map (system: {
            name = system;
            value = f system;
          }) supportedSystems
        );
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          nodePkgs = [
            "typescript"
            "vite"
            "tailwindcss"
            "babylonjs"
            "sqlite3"
          ];
          installNodePkgs = ''
            echo "Installing dependencies: ${builtins.concatStringsSep " " nodePkgs}..."
            npm install --save-dev ${builtins.concatStringsSep " " nodePkgs}
          '';
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_23
              tailwindcss
              sqlite
              fish
            ];
            shellHook = ''
              echo "Launched Transcendence DevShell"
              echo "Using node version: `${pkgs.nodejs_23}/bin/node -v`"
              if [ ! -d "node_modules" ]; then
                if [ ! -f "package.json" ]; then
                  echo "Initializing package.json..."
                  npm init -y
                fi
                ${installNodePkgs}
              else
                echo "All node packages up-to-date!"
              fi
              exec fish
            '';
          };
        }
      );
    };
}
